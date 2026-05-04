import httpStatus from 'http-status';
import prisma from '../../../shared/prisma';
import ApiError from '../../../errors/ApiError';

const create = async (
  userId: string,
  payload: {
    amount: number;
    month: number;
    year: number;
    categoryId: string;
  },
) => {
  const category = await prisma.category.findFirst({
    where: { id: payload.categoryId, userId },
  });

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  const budget = await prisma.budget.create({
    data: { ...payload, userId },
    include: { category: true },
  });

  return budget;
};

const getAll = async (userId: string, month?: number, year?: number) => {
  const where: any = { userId };
  if (month) where.month = month;
  if (year) where.year = year;

  const budgets = await prisma.budget.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate spent amount for each budget
  const budgetsWithSpent = await Promise.all(
    budgets.map(async (budget) => {
      const startDate = new Date(budget.year, budget.month - 1, 1);
      const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);

      const aggregate = await prisma.expense.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: 'EXPENSE',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      });

      return {
        ...budget,
        spent: aggregate._sum.amount || 0,
        remaining: budget.amount - (aggregate._sum.amount || 0),
        percentage: Math.min(
          Math.round(((aggregate._sum.amount || 0) / budget.amount) * 100),
          100,
        ),
      };
    }),
  );

  return budgetsWithSpent;
};

const getById = async (userId: string, id: string) => {
  const budget = await prisma.budget.findFirst({
    where: { id, userId },
    include: { category: true },
  });

  if (!budget) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Budget not found');
  }

  return budget;
};

const update = async (
  userId: string,
  id: string,
  payload: { amount?: number },
) => {
  const existing = await prisma.budget.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Budget not found');
  }

  const budget = await prisma.budget.update({
    where: { id },
    data: payload,
    include: { category: true },
  });

  return budget;
};

const remove = async (userId: string, id: string) => {
  const existing = await prisma.budget.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Budget not found');
  }

  await prisma.budget.delete({ where: { id } });

  return { message: 'Budget deleted successfully' };
};

export const BudgetService = { create, getAll, getById, update, remove };
