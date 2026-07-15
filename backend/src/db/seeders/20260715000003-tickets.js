'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const rows = [
      { title: 'No carga el dashboard', description: 'El panel principal queda en blanco.', priority: 'alta', status: 'abierto', user_id: 2 },
      { title: 'Error al exportar CSV', description: 'La exportación falla con archivos grandes.', priority: 'media', status: 'en_progreso', user_id: 2 },
      { title: 'Caída intermitente del login', description: 'Algunos usuarios no pueden ingresar.', priority: 'critica', status: 'abierto', user_id: 1 },
      { title: 'Ajuste de textos', description: 'Corregir textos de la pantalla de ayuda.', priority: 'baja', status: 'resuelto', user_id: 2 },
      { title: 'Optimizar consulta de reportes', description: 'La consulta de estadísticas es lenta.', priority: 'media', status: 'cerrado', user_id: 1 },
    ].map((t) => ({ ...t, createdAt: now, updatedAt: now, deletedAt: null }));

    await queryInterface.bulkInsert('tickets', rows);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('tickets', null, {});
  },
};
