// import { v2 as cloudinary } from 'cloudinary';
// import fs from "fs"


// cloudinary.config({
//     cloud_name: 'djgd1iinx',
//     api_key: '225119341735496',
//     api_secret: 'GpKHFkvmQ0oJ97492CCsILhNqIY'
// });

// const uploadOnCloudinary = async (localFilePath) => {
//     try {
//         if (!localFilePath) return null;
//         const response = await cloudinary.uploader.upload(
//             localFilePath, {
//             resource_type: "auto"
//         }
//         )
//         console.log("file uploaded on cloudinary. File src: " + response.url)

//         // once the file is uploaded we would delete it from our server
//         fs.unlinkSync(localFilePath)
//         return response
//     } catch (error) {
//         fs.unlinkSync(localFilePath)
//         return null
//     }
// }

// export { uploadOnCloudinary }
import { v2 as cloudinary } from "cloudinary"
import fs from "fs"


cloudinary.config({
    cloud_name: '123',
    api_key: '123',
    api_secret: 'secret'
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        console.log("deleted from cloudinary, publicId : ", publicId);

    } catch (error) {
        console.log("error deleting from cloudinary", error);
        return null
    }
}



export { uploadOnCloudinary, deleteFromCloudinary }