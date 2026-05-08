import { Router } from 'express';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { uploadProfilePicture } from '../../middlewares/upload';

const router = Router();

router.get('/profile', auth(), UserController.getProfile);

router.patch( 
  '/profile',
  auth(),
  validateRequest(UserValidation.updateProfile),
  UserController.updateProfile,
);

router.post(
  '/profile/avatar',
  auth(),
  uploadProfilePicture,
  UserController.uploadAvatar,
);

router.patch(
  '/profile/avatar',
  auth(),
  uploadProfilePicture,
  UserController.uploadAvatar,
);

router.delete('/profile/avatar', auth(), UserController.deleteAvatar);

export const UserRoutes = router;
