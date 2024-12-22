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

//routes


app.use('/api/v1/healthcheck', healthCheckRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/videos', VideoRouter)

app.use(errorHandler)
export { app }