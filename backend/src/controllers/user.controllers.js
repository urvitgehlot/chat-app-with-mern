import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, displayName } = req.body


    if ([username, email, password, displayName].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All feild is required")
    }

    const avatarLocalUrl = req.files?.avatar?.[0].path;

    if (!avatarLocalUrl) {
        throw new ApiError(400, "Avatar is requred")
    }

    const existedUser = await User.find({
        $or: [{email}, {username}],
    })

    if(existedUser){
        throw new ApiError(409, "User with username or email Already Existed")
    }

    const avatar = await uploadOnCloudinary(avatarLocalUrl)

    if(!avatar) {
        throw new ApiError(400, "Avatar is required")
    }


    const user = await User.create({
        username,
        email,
        password,
        displayName,
        displayName,
        avatarUrl: avatar.url,
    });

    const createdUser = User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User register Successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new ApiError(400, "All Feild are required")
    }

    const user = await User.find({
        email,
    })

    if (!user) {
        throw new ApiError(400, "User not exist")
    }

    if (!user.isPasswordCorrect(password)) {
        throw new ApiError(401, "Invalid User Credential")
    }

    user.select("-password")

    return res.status(200).json(
        new ApiResponse(200, user, "Login Successfull")
    )
})

export {
    loginUser,
    registerUser,
}