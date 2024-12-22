import { ApiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
import mongoose from "mongoose"
import { ApiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        if (!user) {
            console.log("User not found");
            throw new ApiError(400, "User not found")
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access and refresh token")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    console.log("Entered register handler");

    const { fullname, email, username, password } = req.body
    //validation
    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    console.log("credentials retrieved");
    // console.log(req.body);


    let existedUser;

    try {
        existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })
        console.log("Exiting user done");

    } catch (error) {
        console.error("Error querying user:", error);
        throw new ApiError(500, "Database query failed");

    }
    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }
    console.log("enetering avatar part ");

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverLocalPath = req.files?.coverImage?.[0]?.path
    // console.log(req.files)
    console.log("multer level reached");

    console.log("Avatar local path", avatarLocalPath);
    // console.log("cover local path", coverLocalPath);
    if (!avatarLocalPath) {
        console.log("Avatar file missing")
        throw new ApiError(400, "avatar file missing")
    }

    // const avatar = await uploadOnCloudinary(avatarLocalPath)
    // let coverImage = ""
    // if (coverLocalPath) {
    //     coverImage = await uploadOnCloudinary(coverLocalPath)
    // }
    // const avatar = await uploadOnCloudinary(avatarLocalPath)
    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)
        console.log("Avatar loaded ", avatar)

    } catch (error) {
        console.log("Error uploading avatar ", error)
        throw new ApiError(500, "Failed to upload avatar")
    }
    // const coverImage = await uploadOnCloudinary(coverLocalPath)
    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverLocalPath)
        console.log("cover Image loaded ", coverImage)

    } catch (error) {
        console.log("Error uploading cover image ", error)
        throw new ApiError(500, "Failed to upload cover image")
    }
    try {
        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering a user")
        }

        return res.status(201).json(new ApiResponse(200, createdUser, "User registered sucessfully"))

    } catch (error) {
        console.log("User creation failed");
        if (avatar) {
            await deleteFromCloudinary(avatar.public_id)
        }
        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id)
        }
        throw new ApiError(500, "Something went wrong while registering a user and images were deleted")

    }
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body
    if (!email) {
        throw new ApiError(400, "Email is required")
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if (!isPasswordCorrect) {
        throw new ApiError(401, "invalid credentials")
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    if (!loggedInUser) {
        throw new ApiError(401, "Cannot find user")
    }
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in sucessfull"
            )
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(400, "Refresh token required")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?.id)
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid refresh token")
        }
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }
        await generateAccessAndRefreshToken(user._id)
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)
        return res.
            status(200)
            .cookie("Access token", accessToken, options)
            .cookie("refresh token", newRefreshToken, options)
            .json(
                new ApiResponse(200, {
                    accessToken,
                    refreshToken: newRefreshToken
                },
                    "Access token refreshed successfully"
                )
            )
    } catch (error) {
        throw new ApiError(500, "Error while refreshing acess token")
    }
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, {
        $set: {
            refreshToken: undefined
        }
    }, {
        new: true
    }
    )
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        )
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordValid) {
        throw new ApiError(404, "Old password is incorrect")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res.status(200).json(new ApiResponse(200, {}, "Password changed sucessfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user details"))
})
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body
    if (!fullname || !email) {
        throw new ApiError(400, "fullname and email are required")
    }
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullname,
            email: email
        }
    }, {
        new: true
    }).select("-password -refreshToken")


    return res.status(200).json(new ApiResponse(200, user, "Account detail update sucessfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path   //req.files nahi kiya kyuki ek hi file thi isliye array ka logic bhi nahi 
    if (!avatarLocalPath) {
        throw new ApiError(400, "File is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(500, "Something went wrong while uploading avatar")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        }, {
        new: true
    }
    ).select("-password -refreshToken")
    return res.status(200).json(new ApiResponse(200, user, "Avatar updated sucessfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverLocalPath = req.file?.path   //req.files nahi kiya kyuki ek hi file thi isliye array ka logic bhi nahi 
    if (!coverLocalPath) {
        throw new ApiError(400, "File is required")
    }
    const coverImage = await uploadOnCloudinary(coverLocalPath)
    if (!coverImage.url) {
        throw new ApiError(500, "Something went wrong while uploading cover")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        }, {
        new: true
    }
    ).select("-password -refreshToken")
    return res.status(200).json(new ApiResponse(200, user, "cover Image updated sucessfully"))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw new ApiError(400, "Username is required")
    }
    const channel = User.aggregate(
        [
            {
                $match: {
                    username: username?.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscriber"
                }
            }, {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id ",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            }, {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"
                    },
                    channelSubscribedToCount: {
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
            }, {
                $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                    subscribersCount: 1,
                    channelSubscribedToCount: 1,
                    isSubscribed: 1,
                    coverImage: 1,
                    email: 1
                }
            }
        ]
    )
    if (!channel?.length) {
        throw new ApiError(400, "Channel not found")

    }
    return res.status(200).json(new ApiResponse(200, channel[0], "channel profile fetched sucessfully"))
})
const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        }, {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [{
                    $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [{
                            $project: {
                                fullname: 1,
                                username: 1,
                                avatar: 1
                            }
                        }]
                    }
                }, {

                }, {
                    $addFields: {
                        owner: {
                            $first: "$owner"
                        }
                    }
                }]
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, user[0]?.watchHistory, "Watch history fetched sucessfully"))
})
export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getWatchHistory,
    getUserChannelProfile
}