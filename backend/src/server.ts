import { createApp } from './app';
import { sequelize } from './models';
import { env } from './config/env';

const start = async () => {
  try {
    await sequelize.authenticate();
    const app = createApp();
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`API escuchando en http://localhost:${env.port}/api`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('No se pudo iniciar el servidor:', err);
    process.exit(1);
  }
};

start();
