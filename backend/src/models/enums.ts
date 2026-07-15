// Enums del dominio. Conjuntos cerrados (no crecen con el tiempo).

export enum RoleName {
  ADMIN = 'admin',
  USER = 'user',
}

export enum TicketPriority {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica',
}

export enum TicketStatus {
  ABIERTO = 'abierto',
  EN_PROGRESO = 'en_progreso',
  RESUELTO = 'resuelto',
  CERRADO = 'cerrado',
}

// Orden numérico de prioridad para evaluar RN-01 (baja < media < alta < critica).
export const PRIORITY_RANK: Record<TicketPriority, number> = {
  [TicketPriority.BAJA]: 1,
  [TicketPriority.MEDIA]: 2,
  [TicketPriority.ALTA]: 3,
  [TicketPriority.CRITICA]: 4,
};
