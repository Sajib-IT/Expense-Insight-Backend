import prisma from '../../../shared/prisma';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { cloudinaryHelper } from '../../../helpers/cloudinaryHelper';

const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

const updateProfile = async (
  userId: string,
  payload: { name?: string; avatar?: string },
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

const uploadAvatar = async (userId: string, buffer: Buffer) => {
  const result = await cloudinaryHelper.uploadProfilePicture(buffer, userId);

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatar: result.secureUrl },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

const deleteAvatar = async (userId: string) => {
  const existing = await prisma.user.findUnique({ where: { id: userId } });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!existing.avatar) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No profile picture to delete');
  }

  await cloudinaryHelper.deleteFile(`expense-insight/avatars/avatar_${userId}`);

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatar: null },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

export const UserService = { getProfile, updateProfile, uploadAvatar, deleteAvatar };
