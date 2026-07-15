import { Op, WhereOptions, Order } from 'sequelize';
import { sequelize, Ticket, User, HistoryLog } from '../models';
import { TicketPriority, TicketStatus, RoleName } from '../models/enums';
import { AppError } from '../utils/AppError';
import { canChangePriority } from '../utils/priority';
import { JwtPayload } from '../utils/jwt';
import { CreateTicketInput, UpdateTicketInput, ListTicketsInput } from '../validators/ticket.validator';

const SORT_COLUMN: Record<string, string> = {
  title: 'title',
  priority: 'priority',
  status: 'status',
  user_id: 'user_id',
  created_at: 'createdAt',
};

export const ticketService = {
  // HU-03: listado con filtros, orden y paginación (excluye soft-deleted vía paranoid).
  async list(query: ListTicketsInput) {
    const where: WhereOptions = {};
    if (query.status) (where as Record<string, unknown>).status = query.status;
    if (query.priority) (where as Record<string, unknown>).priority = query.priority;
    if (query.user_id) (where as Record<string, unknown>).user_id = query.user_id;
    if (query.search) (where as Record<string, unknown>).title = { [Op.like]: `%${query.search}%` };

    const sortCol = query.sortBy ? SORT_COLUMN[query.sortBy] : 'createdAt';
    const order: Order = [[sortCol, query.order.toUpperCase()]];

    const { rows, count } = await Ticket.findAndCountAll({
      where,
      order,
      limit: query.pageSize,
      offset: (query.page - 1) * query.pageSize,
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }],
    });

    return {
      data: rows,
      page: query.page,
      pageSize: query.pageSize,
      total: count,
      totalPages: Math.ceil(count / query.pageSize),
    };
  },

  async getById(id: number) {
    const ticket = await Ticket.findByPk(id, {
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }],
    });
    if (!ticket) throw new AppError(404, 'NOT_FOUND', 'Ticket no encontrado.');
    return ticket;
  },

  // HU-04: crear ticket. Estado inicial `abierto` si no se envía. Registra historial (RN-03).
  async create(input: CreateTicketInput, actor: JwtPayload) {
    return sequelize.transaction(async (tx) => {
      const ticket = await Ticket.create(
        {
          title: input.title,
          description: input.description,
          priority: input.priority,
          status: input.status ?? TicketStatus.ABIERTO,
          user_id: input.user_id,
        },
        { transaction: tx }
      );

      await HistoryLog.create(
        {
          ticket_id: ticket.id,
          user_id: actor.sub,
          date: new Date(),
          priority: ticket.priority,
          status: ticket.status,
        },
        { transaction: tx }
      );

      return ticket;
    });
  },

  // HU-05/HU-06: actualizar. Aplica RN-01 y registra historial de prioridad/estado (RN-03).
  async update(id: number, input: UpdateTicketInput, actor: JwtPayload) {
    return sequelize.transaction(async (tx) => {
      const ticket = await Ticket.findByPk(id, { transaction: tx });
      if (!ticket) throw new AppError(404, 'NOT_FOUND', 'Ticket no encontrado.');

      const priorityChanged = input.priority !== undefined && input.priority !== ticket.priority;
      const statusChanged = input.status !== undefined && input.status !== ticket.status;

      // RN-01: un `user` no puede reducir la prioridad; el `admin` sí.
      if (priorityChanged) {
        const allowed = canChangePriority(actor.role, ticket.priority, input.priority as TicketPriority);
        if (!allowed) {
          throw new AppError(
            403,
            'PRIORITY_CANNOT_DECREASE',
            'Un usuario no puede reducir la prioridad de un ticket (RN-01).'
          );
        }
      }

      if (input.title !== undefined) ticket.title = input.title;
      if (input.description !== undefined) ticket.description = input.description;
      if (input.priority !== undefined) ticket.priority = input.priority;
      if (input.status !== undefined) ticket.status = input.status;
      if (input.user_id !== undefined) ticket.user_id = input.user_id;

      await ticket.save({ transaction: tx });

      // Registra en historial solo si cambió prioridad o estado.
      if (priorityChanged || statusChanged) {
        await HistoryLog.create(
          {
            ticket_id: ticket.id,
            user_id: actor.sub,
            date: new Date(),
            priority: priorityChanged ? ticket.priority : null,
            status: statusChanged ? ticket.status : null,
          },
          { transaction: tx }
        );
      }

      return ticket;
    });
  },

  // HU-07 / RN-02: eliminar (soft delete). La autorización a admin se aplica en la ruta.
  async remove(id: number) {
    const ticket = await Ticket.findByPk(id);
    if (!ticket) throw new AppError(404, 'NOT_FOUND', 'Ticket no encontrado.');
    await ticket.destroy(); // paranoid => soft delete; el historial se conserva.
  },
};
