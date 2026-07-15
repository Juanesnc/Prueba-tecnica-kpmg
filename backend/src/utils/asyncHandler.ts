import { Request, Response, NextFunction, RequestHandler } from 'express';

// Envuelve handlers async para que sus errores lleguen al errorHandler de Express 4.
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
