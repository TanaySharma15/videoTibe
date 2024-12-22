import mongoose from "mongoose"
import { Comment } from "../models/comment.models"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    try {
        const comment = await Comment.find({
            video: videoId,
        })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("owner", "name email")
            .sort({ createdAt: -1 })

        const totalComment = await Comment.countDocuments(videoId)
        if (!comment || comment.length === 0) {
            return res.status(400).json(new ApiError(400, "No comments here"))
        }

        return res.status(200).json({
            success: true,
            data: comment,
            pagination: {
                totalComment: totalComment,
                page: page,
                limit: limit
            }
        })
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Error getting comments"))
    }
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const { content } = req.body
    if (!content) {
        return res.status(400).json(new ApiError(400, "Content is required"));
    }
    if (!videoId) {
        return res.status(400).json(new ApiError(400, "Video ID is required"));
    }
    try {
        const comment = await Comment.create({
            video: videoId,
            owner: req.user._id,
            content: content
        })
        return res.status(200).json(new ApiResponse(200, comment, "Comment sent"))

    } catch (error) {
        return res.status(500).json(new ApiError(500, "Error adding comment"));
    }
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { content } = req.body
    if (!content) {
        return res.status(400).json(new ApiError(400, "Content is required to update the comment"));
    }
    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).json(new ApiError(400, "Invalid comment ID"));
    }
    try {
        const comment = await Comment.findByIdAndUpdate(commentId, {
            $set: {
                content: content
            }
        }, {
            new: true
        })
        if (!comment) {
            return res.status(400).json(new ApiError(400, "Comment not found"))
        }
        return res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"))
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Error occured while updating comment"))
    }
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params
    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).json(new ApiError(400, "Invalid comment ID"));
    }
    try {
        const comment = await Comment.findByIdAndDelete(commentId)
        return res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully"))
    } catch (error) {
        return res.status(400).json(new ApiError(400, "Error occured while adding comment "));
    }
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}