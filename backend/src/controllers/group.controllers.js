import { Group } from "../models/group.model.js";
import { GroupMembership } from "../models/groupMembership.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


const createGroup = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || name == "") {
        throw new ApiError(400, "Group name is required");
    }

    const group = await Group.create({
        name: name,
        description: description ?? "",
    });

    try {
        await GroupMembership.create({
            groupId: group._id,
            userId: req.user._id,
            isAdmin: true,
        });
    } catch (error) {
        await Group.findByIdAndDelete(group._id);
        console.log("Error in createGroup: ", error);
        throw new ApiError(500, "Failed to create group");
    }

    return res.status(201).json({
        success: true,
        message: "Group created successfully",
        data: group,
    });
});

const getGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    if (!groupId || groupId == "") {
        throw new ApiError(400, "Group ID is required");
    }

    const group = await Group.findById(groupId);

    return res.status(200).json({
        success: true,
        message: "Group fetched successfully",
        data: group,
    })
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


export {
    createGroup,
    getGroup,
    getUserAllGroups,
}