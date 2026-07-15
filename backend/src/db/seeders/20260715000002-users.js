'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const hash = (plain) => bcrypt.hashSync(plain, 10);

    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        name: 'Administrador',
        email: 'admin@tickets.dev',
        password: hash('admin1234'),
        role_id: 1, // admin
        estado: 'activo',
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: 2,
        name: 'Usuario Demo',
        email: 'user@tickets.dev',
        password: hash('user1234'),
        role_id: 2, // user
        estado: 'activo',
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: 3,
        name: 'Usuario Inactivo',
        email: 'inactivo@tickets.dev',
        password: hash('user1234'),
        role_id: 2,
        estado: 'inactivo',
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
