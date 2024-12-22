import { Playlist } from "../models/playlist.models"
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const videos = r
    //TODO: create playlist

    try {
        const existingPlaylist = await Playlist.findOne({
            name,
            owner: req.user._id,
        });

        if (existingPlaylist) {
            return res.status(400).json(new ApiError(400, "Playlist with this name already exists"));
        }

        const playlist = await Playlist.create({
            name,
            description,
            owner: req.user._id,
            videos: []
        })
        return res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Error occured while creating playlist"))
    }
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    try {
        const playlist = await Playlist.find({
            owner: userId
        })
        if (!playlist) {
            return res.status(400).json(new ApiError(400, "Playlist not found"))
        }
        return res.status(200).json(new ApiResponse(200, playlist, "Playlist found"))
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Error finding playlist"))
    }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id

    try {
        const playlist = await Playlist.findById(playlistId)
        if (!playlist) {
            return res.status(400).json(new ApiError(400, "Playlist not found"))
        }
        return res.status(200).json(new ApiResponse(200, playlist, "Playlist found"))
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Error finding playlist ! "))
    }

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    try {
        const playlist = await Playlist.findByIdAndUpdate(playlistId, {
            $push: {
                videos: videoId
            }
        }, {
            new: true
        })
        if (!playlist) {
            return res.status(400).json(new ApiError(400, "Playlist not found"))
        }
        return res.status(200).json(new ApiResponse(200, playlist, "Video successfully added to playlist"))
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Error updating playlist"))
    }
})


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    try {
        const playlist = await Playlist.findByIdAndUpdate(playlistId, {
            $pull: {
                videos: videoId
            }
        }, {
            new: true
        })
        if (!playlist) {
            return res.status(400).json(new ApiError(400, "Playlist not found"))
        }
        return res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist"))
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, "Error removing video from playlist"))
    }
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    try {
        const playlist = await Playlist.findByIdAndDelete(playlistId)
        if (!playlist) {
            return res.status(400).json(new ApiError(400, "Playlist not found"))
        }
        return res.status(200).json(new ApiResponse(200, null, "Playlist deleted successfulyy"))
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Error occured while deleting playlist"))
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
    try {
        const playlist = await Playlist.findByIdAndUpdate(playlistId, {
            $set: {
                name: name,
                description: description
            }
        }, {
            new: true
        })
        if (!playlist) {
            return res.status(400).json(new ApiError(400, "Playlist not found"))
        }
        return res.status(200).josn(new ApiResponse(200, playlist, "Playlist updated successfully"))
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Error occured while updating playlist"))
    }
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}