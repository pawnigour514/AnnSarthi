import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { config } from '../config/env.js';
import { ValidationError } from '../utils/errors.js';

// Ensure upload directory exists
if (!fs.existsSync(config.UPLOAD_DIR)) {
  fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, randomName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(
      new ValidationError(
        `Invalid file type (${file.mimetype}). Only JPG, PNG, and WEBP images are allowed.`
      ),
      false
    );
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max per file
    files: 5, // max 5 files per upload
  },
});
