import { AuthUser } from '../types';

const TOKEN_KEY = 'tickets.token';
const USER_KEY = 'tickets.user';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const getUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
};

export const saveSession = (token: string, user: AuthUser): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
