
import dotenv from 'dotenv'
dotenv.config()

import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"


// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
})


// Cloudinary Storage
const storage = new CloudinaryStorage({

  cloudinary: cloudinary,

  params: async (req, file) => {

    return {
      folder: "uploads",

      resource_type: "auto",

      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "mp4",
        "mov",
        "avi",
        "webm"
      ],

    }

  },

})


export { cloudinary, storage }
