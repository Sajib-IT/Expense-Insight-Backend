import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import pick from '../../../shared/pick';
import { paginationFields } from '../../../interfaces/pagination';
import { ExpenseService } from './expense.service';
import ApiError from '../../../errors/ApiError';

const expenseFilterableFields = ['type', 'categoryId', 'startDate', 'endDate', 'searchTerm'];

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await ExpenseService.create(req.user!.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Expense created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query as any, expenseFilterableFields);
  const paginationOptions = pick(req.query as any, paginationFields);
  const result = await ExpenseService.getAll(req.user!.userId, filters as any, paginationOptions);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Expenses retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await ExpenseService.getById(req.user!.userId, req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Expense retrieved successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await ExpenseService.update(req.user!.userId, req.params.id as string, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Expense updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await ExpenseService.remove(req.user!.userId, req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const uploadReceipt = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Receipt file is required');
  }

  const result = await ExpenseService.uploadReceipt(
    req.user!.userId,
    req.params.id as string,
    req.file.buffer,
    req.file.mimetype,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Receipt uploaded successfully',
    data: result,
  });
});

export const ExpenseController = { create, getAll, getById, update, remove, uploadReceipt };
