import { Sequelize } from 'sequelize';
import { env } from './env';

// En tests usamos una base SQLite en memoria y aislada.
const isTest = env.nodeEnv === 'test';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: isTest ? ':memory:' : env.dbStorage,
  logging: false,
});
