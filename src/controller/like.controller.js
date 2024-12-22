import { Like } from "../models/like.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    try {
        const existingLike = await Like.findOne({
            video: videoId,
            likedBy: req.user._id
        })
        if (existingLike) {
            await existingLike.remove()
            return res.status(200).json(new ApiResponse(200, null, "Like removed"))
        } else {
            const newLike = await Like.create({
                video: videoId,
                likedBy: req.user._id
            })
            return res.status(200).json(new ApiResponse(200, newLike, "Like added"))
        }

    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "Error toggling like", error.message));
    }


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment
    try {
        const commentLike = await Like.findOne({
            comment: commentId,
            likedBy: req.user._id
        })
        if (commentLike) {
            await commentLike.remove()
            return res
                .status(200)
                .json(new ApiResponse(200, null, "Like removed from comment"))
        } else {
            const newLike = await Like.create({
                comment: commentId,
                likedBy: req.user._id
            })
            return res
                .status(200)
                .json(new ApiResponse(200, newLike, "Like added on comment"))
        }
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "error occured during operation"))
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
    try {
        const tweetLike = await Like.findOne({
            tweet: tweetId,
            likedBy: req.user._id
        })
        if (tweetLike) {
            await tweetLike.remove()
            return res.status(200).json(new ApiResponse(200, null, "Like removed from tweet"))
        } else {
            const newLike = await Like.create({
                tweet: tweetId,
                likedBy: req.user._id
            })
            return res.status(200).json(new ApiResponse(200, null, "Like added to tweet"))
        }
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Error performing toggle TweetLIke operation"))
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user._id
    try {
        const likes = await Like.find({ likedBy: userId, video: { $exists: true } }).populate("video")
        if (likes.length === 0) {
            return res.status(400).json(new ApiError(400, "Video not found"))
        }
        return res.status(200).json(new ApiResponse(200, likes, "Liked videos found"))
    } catch (error) {
        return res.status(400).json(new ApiError(400, "Error founding videos"))
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}