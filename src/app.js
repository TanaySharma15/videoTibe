import express, { urlencoded } from 'express'
import healthCheckRouter from './routes/healthcheck.routes.js';
import { errorHandler } from "./middleware/error.middleware.js"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true
}))
app.use(express.json({ limit: "16kb" }))
app.use(urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())


//import routes

import userRouter from "./routes/user.routes.js"
import VideoRouter from "./routes/video.route.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import likeRouter from "./routes/like.routes.js"
import commentRouter from "./routes/comment.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"


//routes

app.use('/api/v1/healthcheck', healthCheckRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/videos', VideoRouter)
app.use('/api/v1/tweets', tweetRouter)
app.use('api/v1/subscriptions', subscriptionRouter)
app.use('/api/v1/playlist', playlistRouter)
app.use('/api/v1/likes', likeRouter)
app.use('/api/v1/comments', commentRouter)
app.use('/api/v1/dashboard', dashboardRouter)


app.use(errorHandler)
export { app }