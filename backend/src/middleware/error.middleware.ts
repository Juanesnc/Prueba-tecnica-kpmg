import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

// Manejador central de errores. Convierte AppError en respuesta uniforme.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ code: err.code, message: err.message });
    return;
  }
  // Errores no controlados.
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Error interno del servidor.' });
};

// 404 para rutas no encontradas.
export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ code: 'NOT_FOUND', message: 'Recurso no encontrado.' });
};
