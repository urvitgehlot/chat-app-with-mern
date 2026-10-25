import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'tmp/my-uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  },
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      const allowedTypes = ['image/jpg', 'image/jpeg', 'image/webp', 'image/png']
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
      } else {
        cb(new ApiError(400, 'Invalid file type'), false)
      }
    }
  }
})

export const upload = multer({ storage: storage })