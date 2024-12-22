import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js"
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controller/subscription.controller";

const router = Router()
router.use(verifyJWT)

router.route('/c/:channelId')
    .get(getUserChannelSubscribers)
    .patch(toggleSubscription)

router.route('/u/:subscriberId')
    .get(getSubscribedChannels)

export default router
