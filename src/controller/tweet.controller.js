import { Tweet } from "../models/tweet.models";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

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

})
