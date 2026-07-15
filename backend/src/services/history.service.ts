import { Ticket, HistoryLog, User } from '../models';
import { AppError } from '../utils/AppError';

export const historyService = {
  // HU-08: historial de un ticket (solo lectura, RN-03).
  async listByTicket(ticketId: number) {
    const ticket = await Ticket.findByPk(ticketId, { paranoid: false });
    if (!ticket) throw new AppError(404, 'NOT_FOUND', 'Ticket no encontrado.');

    return HistoryLog.findAll({
      where: { ticket_id: ticketId },
      order: [['date', 'ASC']],
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }],
    });
  },
};
