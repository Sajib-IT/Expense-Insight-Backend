import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import ApiError from '../../../errors/ApiError';

const getProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getProfile(req.user!.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateProfile(req.user!.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const uploadAvatar = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Profile picture is required');
  }

  const result = await UserService.uploadAvatar(req.user!.userId, req.file.buffer);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile picture uploaded successfully',
    data: result,
  });
});

const deleteAvatar = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.deleteAvatar(req.user!.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile picture deleted successfully',
    data: result,
  });
});

export const UserController = { getProfile, updateProfile, uploadAvatar, deleteAvatar };
