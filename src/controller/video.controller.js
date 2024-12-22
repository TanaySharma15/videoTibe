import { Video } from "../models/videos.model.js"
// import User from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import Ffmpeg from "fluent-ffmpeg"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    try {
        const pageNumber = parseInt(page, 10)
        const limitNumber = parseInt(limit, 10)

        const sortOrder = sortType === 'ascending' ? 1 : -1
        const sortOptions = { [sortBy]: sortOrder }
        const searchQuery = {
            ...(query && {
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ]
            }),
            ...(userId && { userId })
        }

        const videos = await Video.find().sort(sortOptions).skip((pageNumber - 1) * limitNumber).limit(limitNumber)

        const totalVideo = await Video.countDocument(searchQuery)

        return res.status(200).json({
            success: true, data: videos,
            pagination: {
                total: totalVideo,
                page: pageNumber,
                limit: limitNumber
            }
        })

    } catch (error) {
        return res.status(500).json(new ApiError(500, "Error while fetching videos"))
    }
})

const publishAVideo = asyncHandler(async (req, res) => {
    console.log("Entered video publishing controller")
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    const videoLocalPath = req.files?.video?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path
    console.log("Local paths found");

    if (!videoLocalPath) {
        return res.status(400).json(new ApiError(400, "Video not found for uploading"))
    }
    if (!thumbnailLocalPath) {
        return res.status(400).json(new ApiError(400, "thumbnail not found for uploading"))
    }
    let newVideo;
    try {
        newVideo = await uploadOnCloudinary(videoLocalPath)
        console.log("Video uploaded on cloudinary");
        console.log(newVideo.url);


    } catch (error) {
        return res.status(500).json(new ApiError(500, "Error uploading videos on cloudinary"))
    }
    console.log("Video uploaded on cloudinary");

    let thumbnail;
    try {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        console.log("Thumbnail uploaded on cloudinary");
        console.log(thumbnail.url);

    } catch (error) {
        return res.status(500).json(new ApiError(500, "Error uploading thumbnail on cloudinary"))
    }
    console.log("Video local path : ", videoLocalPath);

    //Todo add duration automatically

    // let duration;
    // try {
    //     duration = await new Promise((resolve, reject) => {
    //         Ffmpeg.ffprobe(videoLocalPath, (err, metadata) => {
    //             if (err) {
    //                 reject("Error retrieving video duration")
    //             }
    //             else {
    //                 console.log("Video Metadata:", metadata);
    //                 resolve(parseInt(metadata.format.duration, 10))
    //             }
    //         })
    //     })
    //     console.log(duration);

    // } catch (error) {
    //     console.log(error)
    //     return res.status(500).json(new ApiError(500, "Error occured while getting duration"))
    // }

    try {
        console.log("Entering video creating zone");

        const video = await Video.create({
            owner: "675e9fc8431c47f6f8091265",
            title,
            description,
            videoFile: newVideo.url,
            thumbnail: thumbnail.url,
            duration: 5,
            isPublished: true,
            views: 0
        })
        console.log("Video created");

        const uploadedVideo = await Video.findById(video._id)
        if (!uploadedVideo) {
            return res.status(500).json(new ApiError(500, "Error uploading video"))
        }
        return res.status(200).json(new ApiResponse(200, uploadedVideo, "video uploaded sucessfully"))
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Error occured while performing actions"))
    }

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)
    if (!video) {
        return res.status(400).json(new ApiError(400, "video not found"))
    }
    return res.status(200).json(new ApiResponse(200, video, "Video found"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body
    const thumbnailLocalPath = req.file?.path;
    if (!thumbnailLocalPath) {
        return res.status(400).json(new ApiError(400, "thumbnail file not found"))
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!thumbnail.url) {
        return res.status(400).json(new ApiError(400, "Thumbnail error"))
    }
    const video = await Video.findByIdAndUpdate(videoId, {
        $set: {
            title: title,
            description: description,
            thumbnail: thumbnail.url
        }
    }, { new: true })
    return res.status(200).json(new ApiResponse(200, video, "Updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        const video = await Video.findByIdAndDelete(videoId)
        if (!video) {
            return res.status(400).json(new ApiError(400, "video not found"))
        }
        return res.status(200).json(new ApiResponse(200, null, "Video deleted successfully"))

    } catch (error) {
        return res.status(500).json(new ApiError(500, "Some error occured while deleting video"))
    }
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        const video = await Video.findByIdAndUpdate(videoId, [
            {
                $set: {
                    isPublished: { $not: "$isPublished" }
                }
            }
        ], {
            new: true
        })
        return res.status(200).json(new ApiResponse(200, video, "Video publish status toggled"))
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Error occured while toggling status"))
    }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}