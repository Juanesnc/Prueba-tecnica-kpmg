'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tickets', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      priority: {
        type: Sequelize.ENUM('baja', 'media', 'alta', 'critica'),
        allowNull: false,
        defaultValue: 'media',
      },
      status: {
        type: Sequelize.ENUM('abierto', 'en_progreso', 'resuelto', 'cerrado'),
        allowNull: false,
        defaultValue: 'abierto',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('tickets');
  },
};
