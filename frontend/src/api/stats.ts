import { api } from './client';
import { TicketPriority, TicketStatus } from '../types';

export interface TicketStats {
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
  total: number;
}

export const statsApi = {
  summary: () => api.get<TicketStats>('/tickets/stats'),
};
