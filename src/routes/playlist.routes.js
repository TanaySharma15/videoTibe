import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controller/playlist.controller";

const router = Router()
router.use(verifyJWT)

router.route('/')
    .post(createPlaylist)

router.route('/user/:userId')
    .get(getUserPlaylists)

router.route('/:playlistId')
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist)

router.route('/add/:playlistId/:videoId')
    .patch(addVideoToPlaylist)

router.route('/remove/:playlistId/:videoId')
    .delete(removeVideoFromPlaylist)

export default router