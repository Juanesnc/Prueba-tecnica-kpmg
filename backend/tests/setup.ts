import { sequelize, Role } from '../src/models';
import { RoleName } from '../src/models/enums';

// Antes de todas las pruebas: crea el esquema en memoria y siembra los roles base.
beforeAll(async () => {
  await sequelize.sync({ force: true });
  await Role.bulkCreate([
    { id: 1, name: RoleName.ADMIN },
    { id: 2, name: RoleName.USER },
  ]);
});

// Limpia tickets/usuarios entre archivos no es necesario; cada archivo recrea lo que precisa.
afterAll(async () => {
  await sequelize.close();
});
