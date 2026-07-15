import { Request, Response } from 'express';
import { ticketService } from '../services/ticket.service';
import { historyService } from '../services/history.service';
import { statsService } from '../services/stats.service';

export const ticketController = {
  async list(req: Request, res: Response) {
    const result = await ticketService.list(req.query as never);
    res.json(result);
  },

  async getById(req: Request, res: Response) {
    const ticket = await ticketService.getById(Number(req.params.id));
    res.json(ticket);
  },

  async create(req: Request, res: Response) {
    const ticket = await ticketService.create(req.body, req.user!);
    res.status(201).json(ticket);
  },

  async update(req: Request, res: Response) {
    const ticket = await ticketService.update(Number(req.params.id), req.body, req.user!);
    res.json(ticket);
  },

  async remove(req: Request, res: Response) {
    await ticketService.remove(Number(req.params.id));
    res.status(204).send();
  },

  async history(req: Request, res: Response) {
    const entries = await historyService.listByTicket(Number(req.params.id));
    res.json(entries);
  },

  async stats(_req: Request, res: Response) {
    const summary = await statsService.summary();
    res.json(summary);
  },
};
