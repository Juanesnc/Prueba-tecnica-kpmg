import { Role, User } from '../models';
import { RoleName } from '../models/enums';
import { AppError } from '../utils/AppError';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

const publicUser = (user: User, roleName: RoleName) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role_id: user.role_id,
  role: roleName,
});

export const authService = {
  // HU-01: registro. Rol por defecto `user`.
  async register(input: RegisterInput) {
    const exists = await User.findOne({ where: { email: input.email } });
    if (exists) {
      throw new AppError(409, 'EMAIL_TAKEN', 'El correo ya está registrado.');
    }

    const userRole = await Role.findOne({ where: { name: RoleName.USER } });
    if (!userRole) {
      throw new AppError(500, 'ROLE_MISSING', 'El rol por defecto no existe. Ejecuta los seeders.');
    }

    const user = await User.create({
      name: input.name,
      email: input.email,
      password: await hashPassword(input.password),
      role_id: userRole.id,
      estado: 'activo',
    });

    const token = signToken({ sub: user.id, role: RoleName.USER, email: user.email });
    return { token, user: publicUser(user, RoleName.USER) };
  },

  // HU-02: login. Rechaza credenciales inválidas y usuarios inactivos con mensaje genérico.
  async login(input: LoginInput) {
    const user = await User.scope('withPassword').findOne({
      where: { email: input.email },
      include: [{ model: Role, as: 'role' }],
    });

    // Mensaje genérico para no revelar qué campo falló.
    const invalid = () => new AppError(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas.');

    if (!user) throw invalid();
    if (user.estado !== 'activo') throw invalid();

    const ok = await comparePassword(input.password, user.password);
    if (!ok) throw invalid();

    const roleName = (user.role?.name ?? RoleName.USER) as RoleName;
    const token = signToken({ sub: user.id, role: roleName, email: user.email });
    return { token, user: publicUser(user, roleName) };
  },
};
