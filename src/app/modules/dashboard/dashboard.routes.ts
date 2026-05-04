import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import auth from '../../middlewares/auth';

const router = Router();

router.get('/', auth(), DashboardController.getSummary);

export const DashboardRoutes = router;
