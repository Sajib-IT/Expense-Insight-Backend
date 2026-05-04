import { z } from 'zod';

const register = z.object({
  body: z.object({
    name: z.string({ message: 'Name is required' }),
    email: z.string({ message: 'Email is required' }).email('Invalid email address'),
    password: z
      .string({ message: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
  }),
});

const login = z.object({
  body: z.object({
    email: z.string({ message: 'Email is required' }).email('Invalid email address'),
    password: z.string({ message: 'Password is required' }),
  }),
});

const forgotPassword = z.object({
  body: z.object({
    email: z.string({ message: 'Email is required' }).email('Invalid email address'),
  }),
});

const resetPassword = z.object({
  body: z.object({
    token: z.string({ message: 'Token is required' }),
    password: z
      .string({ message: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
  }),
});

const changePassword = z.object({
  body: z.object({
    currentPassword: z.string({ message: 'Current password is required' }),
    newPassword: z
      .string({ message: 'New password is required' })
      .min(6, 'Password must be at least 6 characters'),
  }),
});

const refreshToken = z.object({
  body: z.object({
    refreshToken: z.string({ message: 'Refresh token is required' }),
  }),
});

export const AuthValidation = {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
};
