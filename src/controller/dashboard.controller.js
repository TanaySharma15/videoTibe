import { Video } from "../models/videos.model.js"
import { asyncHandler } from "../middlewares/asyncHandler.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"
const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const { channelId } = req.params
    try {
        const stats = await Video.aggregate(
            [
                {
                    $match: {
                        owner: channelId
                    }
                },
                {
                    $group: {
                        _id: "$owner",
                        totalViews: {
                            $sum: "$views"
                        },
                        totalSubscribers: {
                            $sum: "$subscribers"
                        },
                        totalVideos: {
                            $sum: 1
                        },
                        totalLikes: {
                            $sum: "$likes"
                        },
                        totalComments: {
                            $sum: "$comments"
                        },
                    }
                }, {
                    $project: {
                        _id: 0,
                        totalViews: 1,
                        totalSubscribers: 1,
                        totalVideos: 1,
                        totalLikes: 1,
                        totalComments: 1,
                    }
                }

            ]
        )
        return res.status(200).json(new ApiResponse({
            success: true,
            data: stats,
            message: "Channel stats fetched successfully"
        }))
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Error fetching channel stats"));
    }
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const { channelId } = req.params
    const { page = 1, limit = 10 } = req.query
    if (!channelId) {
        return next(new ApiError("Channel id is required", 400))
    }
    try {
        const videos = await Video.find({ owner: channelId }).skip((page - 1) * limit).limit(limit).populate("owner", "name email").sort({ createdAt: -1 })
        if (!videos || videos.length === 0) {
            return res.status(400).json(new ApiError(404, "No videos found"))
        }
        res.status(200).json(new ApiResponse({
            success: true,
            data: videos,
            pagination: {
                limit,
                page,
                total: videos.length
            },
            message: "Videos fetched successfully"
        }))
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Error fetching videos"));
    }

})

export {
    getChannelStats,
    getChannelVideos
}