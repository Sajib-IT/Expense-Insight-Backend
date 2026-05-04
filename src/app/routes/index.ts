import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { UserRoutes } from '../modules/user/user.routes';
import { ExpenseRoutes } from '../modules/expense/expense.routes';
import { CategoryRoutes } from '../modules/category/category.routes';
import { BudgetRoutes } from '../modules/budget/budget.routes';
import { DashboardRoutes } from '../modules/dashboard/dashboard.routes';
import { AiExtractRoutes } from '../modules/ai-extract/aiExtract.routes';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/expenses', route: ExpenseRoutes },
  { path: '/categories', route: CategoryRoutes },
  { path: '/budgets', route: BudgetRoutes },
  { path: '/dashboard', route: DashboardRoutes },
  { path: '/ai-extract', route: AiExtractRoutes },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
