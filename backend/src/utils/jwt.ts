import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { RoleName } from '../models/enums';

export interface JwtPayload {
  sub: number; // id del usuario
  role: RoleName;
  email: string;
}

export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, env.jwtSecret) as unknown as JwtPayload;
