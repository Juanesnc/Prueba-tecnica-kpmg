import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler, notFound } from './middleware/error.middleware';
import { env } from './config/env';
// Carga las asociaciones del ORM al iniciar la app.
import './models';

export const createApp = () => {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
