import { TransactionType } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../../../shared/prisma';
import ApiError from '../../../errors/ApiError';

const create = async (
  userId: string,
  payload: {
    name: string;
    type: TransactionType;
    icon?: string;
    colour?: string;
  },
) => {
  const category = await prisma.category.create({
    data: { ...payload, userId },
  });

  return category;
};

const getAll = async (userId: string, type?: TransactionType) => {
  const where: any = { userId };
  if (type) where.type = type;

  const categories = await prisma.category.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  return categories;
};

const getById = async (userId: string, id: string) => {
  const category = await prisma.category.findFirst({
    where: { id, userId },
  });

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  return category;
};

const update = async (
  userId: string,
  id: string,
  payload: Partial<{
    name: string;
    type: TransactionType;
    icon: string;
    colour: string;
  }>,
) => {
  const existing = await prisma.category.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  if (existing.isDefault) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Default categories cannot be modified');
  }

  const category = await prisma.category.update({
    where: { id },
    data: payload,
  });

  return category;
};

const remove = async (userId: string, id: string) => {
  const existing = await prisma.category.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  if (existing.isDefault) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Default categories cannot be deleted');
  }

  // Check if category has expenses
  const expenseCount = await prisma.expense.count({
    where: { categoryId: id },
  });

  if (expenseCount > 0) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'Cannot delete category with existing expenses. Move or delete them first.',
    );
  }

  await prisma.category.delete({ where: { id } });

  return { message: 'Category deleted successfully' };
};

export const CategoryService = { create, getAll, getById, update, remove };
