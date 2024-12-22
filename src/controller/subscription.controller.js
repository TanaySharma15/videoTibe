import { Subscription } from "../models/subscription.models"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    try {
        const subscription = await Subscription.findOne({
            channel: channelId,
            subscriber: req.user._id
        })
        if (subscription) {
            await Subscription.deleteOne({
                channel: channelId,
                subscriber: req.user._id
            })
            return res.status(200).json(new ApiResponse(200, { channelId }, "Subscription remove"))
        } else {
            const newSubscription = await Subscription.create({
                channel: channelId,
                subscriber: req.user._id
            })
            return res.status(200).json(new ApiResponse(200, newSubscription, "Subscription added"))
        }
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Error occured while toggling subscription"))
    }
})


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    try {
        const subscriberList = await Subscription.find({
            channel: channelId
        })
            .populate("subscriber", "name email")

        if (subscriberList.length === 0) {
            return res.status(200).json(new ApiResponse(200, subscriberList, "no subscriber for this channel"))
        }

        return res.status(200).json(new ApiResponse(200, subscriberList, "Subscriber fetched for the give channel"))

    } catch (error) {
        return res.status(500).json(new ApiError(500, "Error getting subscriber list"))
    }
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    try {
        const subscribedChannel = await Subscription.findById({
            owner: subscriberId
        }).populate("channel")
        if (!subscribedChannel || subscribedChannel.length === 0) {
            return res.status(400).json(new ApiError(400, "No channel subscribed"))
        }
        return res.status(200).json(new ApiResponse(200, subscribedChannel, "Channels fetched"))
    } catch (error) {
        return res.status(400).json(new ApiError(400, "Error fetching subscribed channels"))
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}