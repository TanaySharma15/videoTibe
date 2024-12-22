import { Router } from "express"
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controller/tweet.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js"


const router = Router()
router.use(verifyJWT)

router.route('/')
    .post(createTweet)

router.route('/:userId')
    .get(getUserTweets)

router.route('/:tweetId')
    .patch(updateTweet)
    .delete(deleteTweet)

export default router