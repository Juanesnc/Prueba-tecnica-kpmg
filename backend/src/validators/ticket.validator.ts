import { z } from 'zod';
import { TicketPriority, TicketStatus } from '../models/enums';

const priorityEnum = z.nativeEnum(TicketPriority);
const statusEnum = z.nativeEnum(TicketStatus);

export const createTicketSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio.'),
  description: z.string().min(1, 'La descripción es obligatoria.'),
  priority: priorityEnum,
  status: statusEnum.optional(), // si se omite, inicia en `abierto`
  user_id: z.coerce.number().int().positive('El usuario asignado es obligatorio.'),
});

export const updateTicketSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    priority: priorityEnum.optional(),
    status: statusEnum.optional(),
    user_id: z.coerce.number().int().positive().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar.',
  });

export const listTicketsSchema = z.object({
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  user_id: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'priority', 'status', 'user_id', 'created_at']).optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type ListTicketsInput = z.infer<typeof listTicketsSchema>;
