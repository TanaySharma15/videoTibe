import { app } from "./app.js";
import dotenv from "dotenv";
import connectDb from "./db/index.js";
dotenv.config({
    path: "./.env"
})
const port = process.env.PORT

connectDb()
    .then(() => {
        app.listen(port, () => {
            console.log(`server is listening on port ${port}`);

        })
    })
    .catch((err) => {
        console.log("Mongodb connection error ", err);

    })
