import { Router } from 'express';
import { AiExtractController } from './aiExtract.controller';
import { AiExtractValidation } from './aiExtract.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { uploadReceipt } from '../../middlewares/upload';

const router = Router();

// POST /ai-extract/receipt — upload receipt image, returns extracted data
router.post(
  '/receipt',
  auth(),
  uploadReceipt,
  AiExtractController.extractFromImage,
);

// POST /ai-extract/text — send free text, returns extracted data
router.post(
  '/text',
  auth(),
  validateRequest(AiExtractValidation.extractFromText),
  AiExtractController.extractFromText,
);

export const AiExtractRoutes = router;
