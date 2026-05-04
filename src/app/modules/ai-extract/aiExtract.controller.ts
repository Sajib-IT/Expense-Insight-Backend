import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AiExtractService } from './aiExtract.service';
import ApiError from '../../../errors/ApiError';

const extractFromImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Receipt image is required');
  }

  const result = await AiExtractService.extractFromImage(
    req.file.buffer,
    req.file.mimetype,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Receipt data extracted successfully',
    data: result,
  });
});

const extractFromText = catchAsync(async (req: Request, res: Response) => {
  const result = await AiExtractService.extractFromText(req.body.text);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Expense data extracted successfully',
    data: result,
  });
});

export const AiExtractController = { extractFromImage, extractFromText };
