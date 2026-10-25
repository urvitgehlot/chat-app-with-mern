import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select(
            '-password -refreshToken'
        );

        if (!user) {
            throw new ApiError(401, "Invalid access token")
        }

        if (user.isBanned) {
            throw new ApiError(403, "You are banned from using this application")
        }

        if (user.isDeleted) {
            throw new ApiError(403, "Your account has been deleted")
        }

        const PROFILE_SETUP_ALLOWED_PATHS = ['/complete-profile-setup', '/current-user'];
        if (!user.username && !PROFILE_SETUP_ALLOWED_PATHS.includes(req.path)) {
            return res.status(403).json(
                new ApiResponse(403, {
                    user,
                    isProfileSetup: false
                }, "Please Setup Your Profile")
            )
        }

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})