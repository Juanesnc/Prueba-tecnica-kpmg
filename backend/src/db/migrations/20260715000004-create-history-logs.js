'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('history_logs', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      ticket_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tickets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      date: { type: Sequelize.DATE, allowNull: false },
      priority: { type: Sequelize.ENUM('baja', 'media', 'alta', 'critica'), allowNull: true },
      status: { type: Sequelize.ENUM('abierto', 'en_progreso', 'resuelto', 'cerrado'), allowNull: true },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('history_logs');
  },
};
