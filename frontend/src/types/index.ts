export type RoleName = 'admin' | 'user';
export type TicketPriority = 'baja' | 'media' | 'alta' | 'critica';
export type TicketStatus = 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role: RoleName;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface Assignee {
  id: number;
  name: string;
  email: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  user_id: number | null;
  assignee?: Assignee | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketPage {
  data: Ticket[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface HistoryEntry {
  id: number;
  ticket_id: number;
  user_id: number;
  date: string;
  priority: TicketPriority | null;
  status: TicketStatus | null;
  author?: Assignee | null;
}

// Orden de prioridad para reflejar RN-01 en la UI.
export const PRIORITY_RANK: Record<TicketPriority, number> = {
  baja: 1,
  media: 2,
  alta: 3,
  critica: 4,
};

export const PRIORITIES: TicketPriority[] = ['baja', 'media', 'alta', 'critica'];
export const STATUSES: TicketStatus[] = ['abierto', 'en_progreso', 'resuelto', 'cerrado'];

export const STATUS_LABEL: Record<TicketStatus, string> = {
  abierto: 'Abierto',
  en_progreso: 'En progreso',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
};
