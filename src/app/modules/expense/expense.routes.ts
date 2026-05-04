import { Router } from 'express';
import { ExpenseController } from './expense.controller';
import { ExpenseValidation } from './expense.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = Router();

router.post(
  '/',
  auth(),
  validateRequest(ExpenseValidation.create),
  ExpenseController.create,
);

router.get(
  '/',
  auth(),
  validateRequest(ExpenseValidation.getAll),
  ExpenseController.getAll,
);

router.get('/:id', auth(), ExpenseController.getById);

router.patch(
  '/:id',
  auth(),
  validateRequest(ExpenseValidation.update),
  ExpenseController.update,
);

router.delete('/:id', auth(), ExpenseController.remove);

export const ExpenseRoutes = router;
