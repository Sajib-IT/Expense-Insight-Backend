import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import config from '../../config';
import ApiError from '../../errors/ApiError';

const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = 'Something went wrong';
  let errorMessages: { path: string; message: string }[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorMessages = [{ path: '', message: err.message }];
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error';
    errorMessages = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'Duplicate entry';
      const target = (err.meta?.target as string[]) || [];
      errorMessages = [
        { path: target.join(', '), message: `${target.join(', ')} already exists` },
      ];
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
      errorMessages = [{ path: '', message: 'The requested record does not exist' }];
    } else {
      message = err.message;
      errorMessages = [{ path: '', message: err.message }];
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Validation error';
    errorMessages = [{ path: '', message: err.message }];
  } else if (err instanceof Error) {
    message = err.message;
    errorMessages = [{ path: '', message: err.message }];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: config.env === 'development' ? err.stack : undefined,
  });
};

export default globalErrorHandler;
