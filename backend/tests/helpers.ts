import { User } from '../src/models';
import { RoleName } from '../src/models/enums';
import { hashPassword } from '../src/utils/password';
import { signToken } from '../src/utils/jwt';

// Crea un usuario con contraseña hasheada y devuelve el registro.
export const createUser = async (opts: {
  name: string;
  email: string;
  password: string;
  role_id: number;
  estado?: 'activo' | 'inactivo';
}) => {
  return User.create({
    name: opts.name,
    email: opts.email,
    password: await hashPassword(opts.password),
    role_id: opts.role_id,
    estado: opts.estado ?? 'activo',
  });
};

// Genera un token válido para un usuario dado (evita depender del login en cada test).
export const tokenFor = (id: number, role: RoleName, email: string) =>
  signToken({ sub: id, role, email });
