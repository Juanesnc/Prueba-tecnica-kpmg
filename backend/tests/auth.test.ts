import request from 'supertest';
import { createApp } from '../src/app';
import { createUser } from './helpers';

const app = createApp();

describe('Autenticación (HU-02)', () => {
  beforeAll(async () => {
    await createUser({
      name: 'Usuario Demo',
      email: 'demo@tickets.dev',
      password: 'secret123',
      role_id: 2, // user
    });
    await createUser({
      name: 'Inactivo',
      email: 'inactivo@tickets.dev',
      password: 'secret123',
      role_id: 2,
      estado: 'inactivo',
    });
  });

  // Prueba 1: Login exitoso
  it('permite el login con credenciales válidas y devuelve un JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@tickets.dev', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ email: 'demo@tickets.dev', role: 'user' });
    // La contraseña nunca se expone.
    expect(res.body.user.password).toBeUndefined();
  });

  // Prueba 2: Login fallido (credenciales incorrectas)
  it('rechaza el login con contraseña incorrecta (mensaje genérico)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@tickets.dev', password: 'incorrecta' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
    expect(res.body.token).toBeUndefined();
  });

  it('rechaza el login de un usuario inactivo', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inactivo@tickets.dev', password: 'secret123' });

    expect(res.status).toBe(401);
  });

  it('registra un usuario nuevo con rol user por defecto', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Nuevo',
      email: 'nuevo@tickets.dev',
      password: 'secret123',
      passwordConfirm: 'secret123',
    });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('user');
    expect(res.body.token).toEqual(expect.any(String));
  });
});
