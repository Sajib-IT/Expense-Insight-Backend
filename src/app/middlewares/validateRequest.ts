import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

const validateRequest =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
      cookies: req.cookies,
    });
    next();
  };

export default validateRequest;
