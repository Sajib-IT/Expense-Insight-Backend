import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import config from '../config';
import ApiError from '../errors/ApiError';
import httpStatus from 'http-status';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export type CloudinaryUploadResult = {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
};

const uploadFromBuffer = (
  buffer: Buffer,
  options: {
    folder: string;
    resourceType?: 'image' | 'raw' | 'auto';
    publicId?: string;
    transformation?: Record<string, any>[];
  },
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType || 'auto',
        public_id: options.publicId,
        transformation: options.transformation,
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(
            new ApiError(
              httpStatus.BAD_REQUEST,
              error?.message || 'File upload failed',
            ),
          );
          return;
        }
        resolve({
          url: result.url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      },
    );
    uploadStream.end(buffer);
  });
};

const uploadProfilePicture = async (
  buffer: Buffer,
  userId: string,
): Promise<CloudinaryUploadResult> => {
  return uploadFromBuffer(buffer, {
    folder: 'expense-insight/avatars',
    resourceType: 'image',
    publicId: `avatar_${userId}`,
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
};

const uploadReceipt = async (
  buffer: Buffer,
  userId: string,
  mimeType: string,
): Promise<CloudinaryUploadResult> => {
  const isPdf = mimeType === 'application/pdf';
  return uploadFromBuffer(buffer, {
    folder: 'expense-insight/receipts',
    resourceType: isPdf ? 'raw' : 'image',
    publicId: `receipt_${userId}_${Date.now()}`,
    transformation: isPdf
      ? undefined
      : [{ quality: 'auto', fetch_format: 'auto' }],
  });
};

const deleteFile = async (publicId: string, resourceType: string = 'image'): Promise<void> => {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};

export const cloudinaryHelper = {
  uploadProfilePicture,
  uploadReceipt,
  deleteFile,
};
