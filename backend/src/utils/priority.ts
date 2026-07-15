import { PRIORITY_RANK, TicketPriority, RoleName } from '../models/enums';

// RN-01: un `user` no puede REDUCIR la prioridad (solo mantener o aumentar).
// El `admin` está exento y sí puede reducirla.
export const canChangePriority = (
  role: RoleName,
  current: TicketPriority,
  next: TicketPriority
): boolean => {
  if (role === RoleName.ADMIN) return true;
  return PRIORITY_RANK[next] >= PRIORITY_RANK[current];
};
