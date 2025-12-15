import {v2 as cloudinary}  from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

function extractPublicId(url) {
  const cleanUrl = url.split('?')[0];                     // remove query params
  const noExtension = cleanUrl.slice(0, cleanUrl.lastIndexOf('.'));

  const parts = noExtension.split("/upload/");
  return parts.length > 1 ? parts[1] : null;
}


const uploadOnCloudinary = async (localFilePath) => {
    if(!localFilePath) return null
    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlink(localFilePath)
        return response
    } catch (error) {
        fs.unlink(localFilePath)
        return null
    }
}

const deleteOnCloudinary = async (fileUrl) => {
    if(!fileUrl) return null

    try {
      const publicId = extractPublicId(fileUrl);
      const response = await cloudinary.uploader.destroy(publicId);

      return response;
    } catch (error) {
        console.log("Error while deleting on cloudinary: ",error);
        return null;
    }
}

export {
  uploadOnCloudinary,
  deleteOnCloudinary,
}