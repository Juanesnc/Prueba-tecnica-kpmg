import { TicketPriority } from '../types';

// Indicador visual de prioridad (badge con color por nivel).
export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return <span className={`badge badge-${priority}`}>{priority}</span>;
}
