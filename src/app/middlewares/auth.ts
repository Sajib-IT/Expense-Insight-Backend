import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import config from '../../config';
import { jwtHelpers } from '../../helpers/jwtHelpers';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

const auth =
  () =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorised');
    }

    try {
      const decoded = jwtHelpers.verifyToken(token, config.jwt.secret);
      req.user = {
        userId: decoded.userId as string,
        email: decoded.email as string,
      };
      next();
    } catch {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
    }
  };

export default auth;
