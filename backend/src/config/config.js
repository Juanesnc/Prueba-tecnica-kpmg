// Configuración consumida por sequelize-cli (migraciones y seeders).
// Usa SQLite por defecto; se puede sobreescribir con variables de entorno.
require('dotenv').config();

const base = {
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: process.env.DB_STORAGE || './data/dev.sqlite',
  logging: false,
};

module.exports = {
  development: base,
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  production: base,
};
