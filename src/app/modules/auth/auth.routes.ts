import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = Router();

router.post(
  '/register',
  validateRequest(AuthValidation.register),
  AuthController.register,
);

router.post(
  '/login',
  validateRequest(AuthValidation.login),
  AuthController.login,
);

router.get('/verify-email/:token', AuthController.verifyEmail);

router.post(
  '/forgot-password',
  validateRequest(AuthValidation.forgotPassword),
  AuthController.forgotPassword,
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.resetPassword),
  AuthController.resetPassword,
);

router.post(
  '/change-password',
  auth(),
  validateRequest(AuthValidation.changePassword),
  AuthController.changePassword,
);

router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshToken),
  AuthController.refreshToken,
);

export const AuthRoutes = router;
