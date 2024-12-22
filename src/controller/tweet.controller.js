import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    if (!content) {
        return res.status(400).json(new ApiError(400, "Content is missing"))
    }
    try {
        const tweet = await Tweet.create({
            owner: req.user._id,
            content
        })
        return res.status(200).json(ApiResponse(200, tweet, "New tweet uploaded successfully"))
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Error uploading tweet"))
    }
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params
    try {
        const userTweet = await Tweet.findById({ owner: userId }).populate("owner", "name email")
        if (!userTweet || userTweet.length === 0) {
            return res.status(404).json(new ApiError(404, "No tweets found for this user"));
        }
    } catch (error) {
        console.error("Error fetching user tweets:", error);
        return res.status(500).json(new ApiError(500, "An error occurred while fetching user tweets"));
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body
    if (!content) {
        return res.status(400).json(new ApiError(400, "Content is required for updating the tweet"));
    }
    try {
        const tweet = await Tweet.findByIdAndUpdate(tweetId, {
            $set: {
                content: content
            }
        }, {
            new: true
        })
        if (!tweet) {
            return res.status(400).json(new ApiError(400, "Tweet not found"))
        }
        return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"))
    } catch (error) {
        return res.status(500).json(new ApiError(400, "Tweet not found"))
    }
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    try {
        const tweet = await Tweet.findByIdAndDelete(tweetId)
        if (!tweet) {
            return res.status(404).json(new ApiError(404, "Tweet not found"));
        }
        return res.status(200).json(new ApiResponse(200, null, "Tweet deleted successfully"))
    } catch (error) {
        return res.status(500).json(new ApiError(400, "Tweet not deleted"))
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}