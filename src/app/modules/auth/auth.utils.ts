import crypto from 'crypto';
import config from '../../../config';

export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const getResetTokenExpiry = (): Date => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1); // 1 hour expiry
  return expiry;
};

export const buildVerificationUrl = (token: string): string => {
  return `${config.clientUrl}/verify-email?token=${token}`;
};

export const buildResetUrl = (token: string): string => {
  return `${config.clientUrl}/reset-password?token=${token}`;
};
