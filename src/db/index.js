import { DB_NAME } from "../../constants.js"
import mongoose from "mongoose"

const connectDb = async () => {
    try {
        const connectionInstance = await mongoose.connect(`mongodb+srv://webtanaydev:WgkGmB9BefBee4Dn@cluster0.uxk6ipe.mongodb.net/vidtube`)
        console.log(`Mongo Db connected ${connectionInstance.connection.host}`);
        console.log("Connected to database:", mongoose.connection.name);
        // console.log("Using collection:", User.collection.name);
    } catch (error) {
        console.log("Mongodb connection error", error);
        process.exit(1)

    }
}
export default connectDb