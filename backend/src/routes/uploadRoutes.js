import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middlewares/authMiddleware.js';
import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'spotify_clone/profiles',
    allowedFormats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => `${req.user._id}-${Date.now()}`
  }
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

router.post('/profile', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const profileImagePath = req.file.path; // Cloudinary URL returns in req.file.path

    
    // Update user in DB
    const user = await User.findById(req.user._id);
    user.profileImage = profileImagePath;
    await user.save();

    res.json({
      message: 'Image uploaded successfully',
      profileImage: profileImagePath
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

export default router;
