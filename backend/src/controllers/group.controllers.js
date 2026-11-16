import mongoose from "mongoose";
import { Group } from "../models/group.model.js";
import { GroupMembership } from "../models/groupMembership.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";


const createGroup = asyncHandler(async (req, res) => {
    const { name, description, userIds } = req.body;

    if (!name || name == "") {
        throw new ApiError(400, "Group name is required");
    }

    let createdGroup = null;
    const dbSession = await mongoose.startSession();
    try {
        await dbSession.withTransaction(async () => {
            const group = await Group.create({
                name: name.trim(),
                description: description ?? "",
            });
            createdGroup = group;

            await GroupMembership.create({
                groupId: group._id,
                userId: req.user._id,
                isAdmin: true,
            });

            if (userIds && userIds.length > 0) {
                const uniqueUserIds = [...new Set(userIds.map((id) => id.toString()))].filter(
                    (id) => id !== req.user._id.toString()
                );

                await Promise.all(
                    uniqueUserIds.map(async (user) => {
                        if (!mongoose.isValidObjectId(user)) {
                            return;
                        }

                        const existingUser = await User.findById(user);
                        if (
                            !existingUser ||
                            existingUser.isDeleted ||
                            existingUser.isBanned
                        ) {
                            return;
                        }

                        await GroupMembership.create({
                            groupId: group._id,
                            userId: user,
                            isAdmin: false,
                            invitedBy: req.user._id,
                        });
                    })
                );
            }
        });
    } catch (error) {
        console.log("Error in createGroup: ", error);
        throw new ApiError(500, "Failed to create group");
    } finally {
        await dbSession.endSession();
    }

    return res.status(201).json(
        new ApiResponse(201, createdGroup, "Group created successfully")
    );
});

const addUserToGroup = asyncHandler(async (req, res) => {
    const { groupId, userId } = req.body;

    if (!groupId || !userId) {
        throw new ApiError(400, "Group ID and User ID are required");
    }

    const group = await Group.findById(groupId);
    if (!group) {
        throw new ApiError(404, "Group not found");
    }

    // Verify requesting user is an active member/admin of the group
    const requestingMembership = await GroupMembership.findOne({
        groupId,
        userId: req.user._id,
        isRemoved: false,
    });

    if (!requestingMembership) {
        throw new ApiError(403, "You must be a member of the group to add users");
    }

    const userToAdd = await User.findById(userId);
    if (!userToAdd || userToAdd.isDeleted || userToAdd.isBanned) {
        throw new ApiError(404, "User to add not found or suspended");
    }

    // Check if user is already a member
    const existingMembership = await GroupMembership.findOne({
        groupId,
        userId,
    });

    if (existingMembership) {
        if (!existingMembership.isRemoved) {
            throw new ApiError(409, "User is already a member of this group");
        }
        // If previously removed/left, reactivate
        existingMembership.isRemoved = false;
        existingMembership.removedBy = null;
        existingMembership.leftAt = null;
        existingMembership.invitedBy = req.user._id;
        await existingMembership.save();

        return res.status(200).json(
            new ApiResponse(200, existingMembership, "User added back to group successfully")
        );
    }

    const membership = await GroupMembership.create({
        groupId,
        userId,
        isAdmin: false,
        invitedBy: req.user._id,
    });

    return res.status(201).json(
        new ApiResponse(201, membership, "User added to group successfully")
    );
});

const getGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    if (!groupId || groupId == "") {
        throw new ApiError(400, "Group ID is required");
    }

    const group = await Group.findById(groupId);
    if (!group) {
        throw new ApiError(404, "Group not found");
    }

    // Populate active members
    const memberships = await GroupMembership.find({
        groupId,
        isRemoved: false,
    }).populate("userId", "_id displayName username avatarUrl lastActiveAt aboutMe");

    const participants = memberships
        .map((m) => {
            if (!m.userId) return null;
            return {
                ...m.userId.toObject(),
                isAdmin: m.isAdmin,
                joinedAt: m.joinedAt,
            };
        })
        .filter(Boolean);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                ...group.toObject(),
                participants,
            },
            "Group fetched successfully"
        )
    );
});

const getUserAllGroups = asyncHandler(async (req, res) => {
    const groups = await GroupMembership.aggregate([
        {
            $match: {
                userId: req.user._id,
            }
        },
        // {
        //     $group: "$groupId"
        // },
        {
            $lookup: {
                from: "groups",
                localField: "groupId",
                foreignField: "_id",
                as: "group",
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            groups,
            "User all groups fetched successfully",
        )
    );
});


const updateGroupDetails = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { name, description } = req.body;
    const avatarFile = req.file;

    if (!groupId || !mongoose.isValidObjectId(groupId)) {
        throw new ApiError(400, "Invalid Group ID");
    }

    const group = await Group.findById(groupId);
    if (!group) {
        throw new ApiError(404, "Group not found");
    }

    // Verify requesting user is an active admin of the group
    const membership = await GroupMembership.findOne({
        groupId,
        userId: req.user._id,
        isRemoved: false,
    });

    if (!membership || !membership.isAdmin) {
        throw new ApiError(403, "Only group admins can update group details");
    }

    // Process photo upload if provided
    if (avatarFile) {
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!allowedMimeTypes.includes(avatarFile.mimetype)) {
            throw new ApiError(400, "Group photo must be a jpeg, png, webp or jpg image");
        }

        const uploadedAvatar = await uploadOnCloudinary(avatarFile.path);
        if (!uploadedAvatar?.url) {
            throw new ApiError(500, "Failed to upload group photo");
        }

        if (group.avatarUrl) {
            await deleteOnCloudinary(group.avatarUrl);
        }

        group.avatarUrl = uploadedAvatar.secure_url || uploadedAvatar.url;
    }

    if (name !== undefined && name !== null) {
        if (!name.trim()) {
            throw new ApiError(400, "Group name cannot be empty");
        }
        group.name = name.trim();
    }

    if (description !== undefined && description !== null) {
        group.description = description.trim();
    }

    await group.save();

    // Populate active members
    const memberships = await GroupMembership.find({
        groupId,
        isRemoved: false,
    }).populate("userId", "_id displayName username avatarUrl lastActiveAt aboutMe");

    const participants = memberships
        .map((m) => {
            if (!m.userId) return null;
            return {
                ...m.userId.toObject(),
                isAdmin: m.isAdmin,
                joinedAt: m.joinedAt,
            };
        })
        .filter(Boolean);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                ...group.toObject(),
                participants,
            },
            "Group details updated successfully"
        )
    );
});

export {
    createGroup,
    addUserToGroup,
    getGroup,
    getUserAllGroups,
    updateGroupDetails,
}