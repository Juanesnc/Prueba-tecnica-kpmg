import { api } from './client';
import { Ticket, TicketPage, HistoryEntry, TicketPriority, TicketStatus } from '../types';

export interface TicketFilters {
  status?: TicketStatus | '';
  priority?: TicketPriority | '';
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface TicketPayload {
  title: string;
  description: string;
  priority: TicketPriority;
  status?: TicketStatus;
  user_id: number;
}

const toQuery = (filters: TicketFilters): string => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) params.set(k, String(v));
  });
  const s = params.toString();
  return s ? `?${s}` : '';
};

export const ticketsApi = {
  list: (filters: TicketFilters) => api.get<TicketPage>(`/tickets${toQuery(filters)}`),
  get: (id: number) => api.get<Ticket>(`/tickets/${id}`),
  create: (payload: TicketPayload) => api.post<Ticket>('/tickets', payload),
  update: (id: number, payload: Partial<TicketPayload>) => api.put<Ticket>(`/tickets/${id}`, payload),
  remove: (id: number) => api.del<void>(`/tickets/${id}`),
  history: (id: number) => api.get<HistoryEntry[]>(`/tickets/${id}/history`),
};
