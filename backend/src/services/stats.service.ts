import { fn, col } from 'sequelize';
import { Ticket } from '../models';
import { TicketPriority, TicketStatus } from '../models/enums';

const zeroed = <T extends string>(values: T[]): Record<T, number> =>
  values.reduce((acc, v) => ({ ...acc, [v]: 0 }), {} as Record<T, number>);

export const statsService = {
  // HU-09: resumen por estado y por prioridad (excluye soft-deleted vía paranoid).
  async summary() {
    const byStatusRows = (await Ticket.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    })) as unknown as Array<{ status: TicketStatus; count: number }>;

    const byPriorityRows = (await Ticket.findAll({
      attributes: ['priority', [fn('COUNT', col('id')), 'count']],
      group: ['priority'],
      raw: true,
    })) as unknown as Array<{ priority: TicketPriority; count: number }>;

    const byStatus = zeroed(Object.values(TicketStatus));
    let total = 0;
    for (const row of byStatusRows) {
      byStatus[row.status] = Number(row.count);
      total += Number(row.count);
    }

    const byPriority = zeroed(Object.values(TicketPriority));
    for (const row of byPriorityRows) {
      byPriority[row.priority] = Number(row.count);
    }

    return { byStatus, byPriority, total };
  },
};
