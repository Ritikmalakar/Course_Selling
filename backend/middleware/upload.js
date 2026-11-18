
import multer from 'multer'
import { storage } from '../config/cloudinary.js'


const upload = multer({
  storage: storage,

  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB
  },

  fileFilter: (req, file, cb) => {

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/quicktime',
      'video/webm',
      'video/x-msvideo'
    ]

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only image and video files are allowed!'))
    }

  }

})


export default upload
