import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/upload
 * Protected (Admin only): Handles single image file upload directly to Cloudinary
 */
router.post('/', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided in the request.',
      });
    }

    // Cloudinary URL returned by multer-storage-cloudinary
    const imageUrl = req.file.path || req.file.secure_url;
    const publicId = req.file.filename || req.file.public_id;

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully.',
      url: imageUrl,
      public_id: publicId,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload image to Cloudinary.',
      error: error.message,
    });
  }
});

export default router;
