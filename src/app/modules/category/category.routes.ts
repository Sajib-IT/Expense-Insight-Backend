import { Router } from 'express';
import { CategoryController } from './category.controller';
import { CategoryValidation } from './category.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = Router();

router.post(
  '/',
  auth(),
  validateRequest(CategoryValidation.create),
  CategoryController.create,
);

router.get('/', auth(), CategoryController.getAll);

router.get('/:id', auth(), CategoryController.getById);

router.patch(
  '/:id',
  auth(),
  validateRequest(CategoryValidation.update),
  CategoryController.update,
);

router.delete('/:id', auth(), CategoryController.remove);

export const CategoryRoutes = router;
