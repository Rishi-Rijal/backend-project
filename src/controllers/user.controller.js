import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidEmail } from "../validators/emailValidator.js";
import { isValidPassword } from "../validators/passwordValidator.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while refresh and access token")
    }

}

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullName, password } = req.body;
    console.log(req.body);

    if (!(username && email && fullName && password)) {
        throw new ApiError(400, "Fill all the required fields");
    }

    if (!isValidEmail(email)) {
        throw new ApiError(400, "Invalid email");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existingUser) {
        throw new ApiError(409, "Username or Email Already taken");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required!")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    let coverImage = ""
    if (req.files?.coverImage) {
        const coverImageLocalPath = req.files?.coverImage[0]?.path;
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }


    const { valid, errors: errorsArr } = isValidPassword(password);
    if (!valid) {
        throw new ApiError(400, "invalid password", errorsArr);
        // throw new ApiError(400, "invalid password", errorsArr)
    }
    // console.log(username, email, password, fullName);
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while saving the data")
    }


    return res.status(201).json(new ApiResponse(200, createdUser, "User Registered Successfully!"));

})

const loginUser = asyncHandler(async (req, res) => {
    console.log(req.body);

    const { email, username, password } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "Username and Password required");
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user) {
        throw new ApiError(400, "Invalid username or email");
    }

    const isPassValid = await user.isPasswordCorrect(password);
    if (!isPassValid) {
        throw new ApiError(401, "Invalid Password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
                "user logged in successfully")
        );
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        { new: true }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .satus(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is Expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, newRefreshToken }, "Token refreshed successfully"))
    } catch (error) {
        throw ApiError(400, error?.message || "invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confPassword } = req.body;
    if (newPassword !== confPassword) {
        throw new ApiError(400, "new password and conform password must be same")
    }
    const user = await User.findById(req.user._id)
    const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "invalid old password")
    }

    const { valid, errors } = isValidPassword(newPassword);
    if (!valid) {
        throw new ApiError(400, "not suitable new Password", errors)
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User fetched successfully"))
})

const updateCurrentAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullName: fullName,
                email: email
            }
        },
        { new: true }
    ).select("-password -refreshToken")

    res
        .status(200)
        .json(new ApiResponse(200, { user }, "user data updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar image file is missing")
    }
    avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw new ApiError(500, "Error while uploading the avatar")
    }
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(new ApiResponse(200, { user }, "Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "cover image file is missing")
    }
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        throw new ApiError(500, "Error while uploading the avatar")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(new ApiResponse(200, { user }, "coverImage updated successfully"))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing")
    }
    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                foreignField: "creator",
                localField: "_id",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                foreignField: "subscriber",
                localField: "_id",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                subscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])
    if(!channel?.length){
        throw new ApiError(400, "channel does not exist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User data fetched successfully"))
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateCurrentAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile
}
