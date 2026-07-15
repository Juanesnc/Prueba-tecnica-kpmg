import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// Valida body/query/params contra un esquema Zod; en error responde 422.
type Source = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodSchema, source: Source = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      // Reasigna los datos ya validados/normalizados.
      (req as unknown as Record<Source, unknown>)[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(422).json({
          code: 'VALIDATION_ERROR',
          message: 'Error de validación.',
          errors: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        });
        return;
      }
      next(err);
    }
  };
