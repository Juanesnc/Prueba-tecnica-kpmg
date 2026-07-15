import request from 'supertest';
import { createApp } from '../src/app';
import { createUser, tokenFor } from './helpers';
import { RoleName } from '../src/models/enums';
import { HistoryLog } from '../src/models';

const app = createApp();

let adminToken: string;
let userToken: string;
let assigneeId: number;

beforeAll(async () => {
  const admin = await createUser({
    name: 'Admin',
    email: 'admin@tickets.dev',
    password: 'secret123',
    role_id: 1,
  });
  const user = await createUser({
    name: 'User',
    email: 'user@tickets.dev',
    password: 'secret123',
    role_id: 2,
  });
  adminToken = tokenFor(admin.id, RoleName.ADMIN, admin.email);
  userToken = tokenFor(user.id, RoleName.USER, user.email);
  assigneeId = user.id;
});

const createTicket = (token: string, overrides: Record<string, unknown> = {}) =>
  request(app)
    .post('/api/tickets')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Ticket de prueba',
      description: 'Descripción',
      priority: 'media',
      user_id: assigneeId,
      ...overrides,
    });

describe('Tickets', () => {
  // Prueba 3: Creación de ticket
  it('crea un ticket con estado inicial abierto (HU-04)', async () => {
    const res = await createTicket(userToken);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('abierto');
    expect(res.body.priority).toBe('media');
  });

  it('requiere autenticación para listar tickets', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(401);
  });

  // Prueba 4: RN-01 — un usuario no puede reducir la prioridad
  describe('RN-01 · prioridad', () => {
    it('rechaza que un user reduzca la prioridad (alta -> media)', async () => {
      const created = await createTicket(userToken, { priority: 'alta' });
      const id = created.body.id;

      const res = await request(app)
        .put(`/api/tickets/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ priority: 'media' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('PRIORITY_CANNOT_DECREASE');
    });

    it('permite que un user aumente la prioridad (media -> alta)', async () => {
      const created = await createTicket(userToken, { priority: 'media' });
      const id = created.body.id;

      const res = await request(app)
        .put(`/api/tickets/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ priority: 'alta' });

      expect(res.status).toBe(200);
      expect(res.body.priority).toBe('alta');
    });

    it('permite que un admin reduzca la prioridad (exento de RN-01)', async () => {
      const created = await createTicket(adminToken, { priority: 'alta' });
      const id = created.body.id;

      const res = await request(app)
        .put(`/api/tickets/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ priority: 'baja' });

      expect(res.status).toBe(200);
      expect(res.body.priority).toBe('baja');
    });
  });

  // Prueba 5: RN-02 — solo admin puede eliminar
  describe('RN-02 · eliminación', () => {
    it('rechaza que un user elimine un ticket', async () => {
      const created = await createTicket(userToken);
      const id = created.body.id;

      const res = await request(app)
        .delete(`/api/tickets/${id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('permite que un admin elimine un ticket (soft delete)', async () => {
      const created = await createTicket(userToken);
      const id = created.body.id;

      const del = await request(app)
        .delete(`/api/tickets/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(del.status).toBe(204);

      // Ya no aparece en el detalle.
      const get = await request(app)
        .get(`/api/tickets/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(get.status).toBe(404);
    });
  });

  // Prueba 6 (bonus): RN-03 — el historial se registra correctamente
  describe('RN-03 · historial', () => {
    it('registra una entrada de historial al crear y al cambiar estado', async () => {
      const created = await createTicket(userToken, { priority: 'media' });
      const id = created.body.id;

      await request(app)
        .put(`/api/tickets/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'en_progreso' });

      const res = await request(app)
        .get(`/api/tickets/${id}/history`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      // Una entrada por la creación + una por el cambio de estado.
      expect(res.body.length).toBe(2);
      expect(res.body[1].status).toBe('en_progreso');
    });

    it('el historial es inmutable: no se puede actualizar ni eliminar (RN-03)', async () => {
      const created = await createTicket(userToken);
      const entry = await HistoryLog.findOne({ where: { ticket_id: created.body.id } });
      expect(entry).not.toBeNull();

      await expect(entry!.update({ status: null })).rejects.toThrow(/inmutable/);
      await expect(entry!.destroy()).rejects.toThrow(/inmutable/);
    });
  });
});
