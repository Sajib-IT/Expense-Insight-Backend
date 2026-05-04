import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import prisma from '../../../shared/prisma';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { emailHelper } from '../../../helpers/emailHelper';
import {
  generateVerificationToken,
  generateResetToken,
  getResetTokenExpiry,
  buildVerificationUrl,
  buildResetUrl,
} from './auth.utils';

const register = async (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  const existing = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, 'Email already registered');
  }

  const hashedPassword = await bcrypt.hash(payload.password, config.bcryptSaltRounds);
  const verificationToken = generateVerificationToken();

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      verificationToken,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
      createdAt: true,
    },
  });

  // Send verification email
  const verificationUrl = buildVerificationUrl(verificationToken);
  await emailHelper.sendEmail({
    to: payload.email,
    subject: 'Verify your Expense Insight account',
    html: `
      <h2>Welcome to Expense Insight!</h2>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in 24 hours.</p>
    `,
  });

  return user;
};

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  const tokenPayload = { userId: user.id, email: user.email };

  const accessToken = jwtHelpers.createToken(
    tokenPayload,
    config.jwt.secret,
    config.jwt.expiresIn,
  );

  const refreshToken = jwtHelpers.createToken(
    tokenPayload,
    config.jwt.refreshSecret,
    config.jwt.refreshExpiresIn,
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    },
  };
};

const verifyEmail = async (token: string) => {
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired verification token');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
    },
  });

  return { message: 'Email verified successfully' };
};

const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Return success even if user not found to prevent email enumeration
    return { message: 'If the email exists, a reset link has been sent' };
  }

  const resetToken = generateResetToken();
  const resetTokenExpiry = getResetTokenExpiry();

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry },
  });

  const resetUrl = buildResetUrl(resetToken);
  await emailHelper.sendEmail({
    to: email,
    subject: 'Reset your Expense Insight password',
    html: `
      <h2>Password Reset</h2>
      <p>You requested a password reset. Click the link below:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });

  return { message: 'If the email exists, a reset link has been sent' };
};

const resetPassword = async (token: string, newPassword: string) => {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gte: new Date() },
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired reset token');
  }

  const hashedPassword = await bcrypt.hash(newPassword, config.bcryptSaltRounds);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return { message: 'Password reset successfully' };
};

const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Current password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(newPassword, config.bcryptSaltRounds);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: 'Password changed successfully' };
};

const refreshAccessToken = async (token: string) => {
  try {
    const decoded = jwtHelpers.verifyToken(token, config.jwt.refreshSecret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId as string },
    });

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
    }

    const tokenPayload = { userId: user.id, email: user.email };

    const accessToken = jwtHelpers.createToken(
      tokenPayload,
      config.jwt.secret,
      config.jwt.expiresIn,
    );

    return { accessToken };
  } catch {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
  }
};

export const AuthService = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshAccessToken,
};
