import { Router } from 'express';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = Router();

router.get('/profile', auth(), UserController.getProfile);

router.patch(
  '/profile',
  auth(),
  validateRequest(UserValidation.updateProfile),
  UserController.updateProfile,
);

export const UserRoutes = router;
