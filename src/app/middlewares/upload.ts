import multer from 'multer';
import path from 'path';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';

const storage = multer.memoryStorage();

const imageFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(httpStatus.BAD_REQUEST, 'Only JPEG, PNG, WebP, and HEIC images are allowed'));
  }
};

const receiptFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'application/pdf',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(httpStatus.BAD_REQUEST, 'Only JPEG, PNG, WebP, HEIC images and PDF files are allowed'));
  }
};

export const uploadProfilePicture = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('avatar');

export const uploadReceipt = multer({
  storage,
  fileFilter: receiptFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
}).single('receipt');
