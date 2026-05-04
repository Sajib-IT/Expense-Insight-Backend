import { Prisma, TransactionType } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../../../shared/prisma';
import ApiError from '../../../errors/ApiError';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { IGenericResponse } from '../../../interfaces/common';

type ExpenseFilters = {
  searchTerm?: string;
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
};

const create = async (
  userId: string,
  payload: {
    amount: number;
    description?: string;
    date: string;
    type: TransactionType;
    categoryId: string;
  },
) => {
  const category = await prisma.category.findFirst({
    where: { id: payload.categoryId, userId },
  });

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  const expense = await prisma.expense.create({
    data: {
      amount: payload.amount,
      description: payload.description,
      date: new Date(payload.date),
      type: payload.type,
      categoryId: payload.categoryId,
      userId,
    },
    include: { category: true },
  });

  return expense;
};

const getAll = async (
  userId: string,
  filters: ExpenseFilters,
  paginationOptions: IPaginationOptions,
): Promise<IGenericResponse<any[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);

  const where: Prisma.ExpenseWhereInput = { userId };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.date.lte = new Date(filters.endDate);
    }
  }

  if (filters.searchTerm) {
    where.description = { contains: filters.searchTerm, mode: 'insensitive' };
  }

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { category: true },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: expenses,
  };
};

const getById = async (userId: string, id: string) => {
  const expense = await prisma.expense.findFirst({
    where: { id, userId },
    include: { category: true },
  });

  if (!expense) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expense not found');
  }

  return expense;
};

const update = async (
  userId: string,
  id: string,
  payload: Partial<{
    amount: number;
    description: string;
    date: string;
    type: TransactionType;
    categoryId: string;
  }>,
) => {
  const existing = await prisma.expense.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expense not found');
  }

  const data: Prisma.ExpenseUpdateInput = { ...payload };
  if (payload.date) {
    data.date = new Date(payload.date);
  }

  const expense = await prisma.expense.update({
    where: { id },
    data,
    include: { category: true },
  });

  return expense;
};

const remove = async (userId: string, id: string) => {
  const existing = await prisma.expense.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expense not found');
  }

  await prisma.expense.delete({ where: { id } });

  return { message: 'Expense deleted successfully' };
};

export const ExpenseService = { create, getAll, getById, update, remove };
