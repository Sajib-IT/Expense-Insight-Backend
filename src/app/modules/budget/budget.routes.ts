import { Router } from 'express';
import { BudgetController } from './budget.controller';
import { BudgetValidation } from './budget.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = Router();

router.post(
  '/',
  auth(),
  validateRequest(BudgetValidation.create),
  BudgetController.create,
);

router.get(
  '/',
  auth(),
  validateRequest(BudgetValidation.getAll),
  BudgetController.getAll,
);

router.get('/:id', auth(), BudgetController.getById);

router.patch(
  '/:id',
  auth(),
  validateRequest(BudgetValidation.update),
  BudgetController.update,
);

router.delete('/:id', auth(), BudgetController.remove);

export const BudgetRoutes = router;
