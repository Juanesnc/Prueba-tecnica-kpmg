import { Request, Response, NextFunction } from 'express';
import { RoleName } from '../models/enums';
import { AppError } from '../utils/AppError';

// Autorización por rol. Ej: authorize(RoleName.ADMIN) restringe a administradores.
export const authorize =
  (...roles: RoleName[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'No autenticado.');
    }
    if (!roles.includes(req.user.role)) {
      throw new AppError(403, 'FORBIDDEN', 'No tienes permisos para realizar esta acción.');
    }
    next();
  };
