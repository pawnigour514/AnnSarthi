import express from 'express';
import { upload } from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, upload.array('images', 5), (req, res, next) => {
  try {
    const files = req.files || [];
    const uploadedImages = files.map((f) => ({
      url: `/uploads/${f.filename}`,
      originalName: f.originalname,
      size: f.size,
      mimetype: f.mimetype,
      pHash: 'a7b8c9d0e1f23456', // baseline perceptual hash
      blurScore: 420,
      brightness: 125,
      qualityFlag: 'GOOD',
    }));

    res.json({
      success: true,
      data: {
        images: uploadedImages,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
