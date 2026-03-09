import { apiPost } from './client.js';
import type { AuthCredentials, RegisterPayload, User } from '../types/index.js';
import { LocalStorageKey } from '../types/index.js';

interface LoginResponse {
  token: string;
  user: User;
}

export async function signIn(credentials: AuthCredentials): Promise<User> {
  const response = await apiPost<AuthCredentials, LoginResponse>(
    '/auth/login',
    credentials
  );
  localStorage.setItem(LocalStorageKey.Token, response.token);
  localStorage.setItem(LocalStorageKey.User, JSON.stringify(response.user));
  return response.user;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const response = await apiPost<RegisterPayload, LoginResponse>(
    '/auth/register',
    payload
  );
  localStorage.setItem(LocalStorageKey.Token, response.token);
  localStorage.setItem(LocalStorageKey.User, JSON.stringify(response.user));
  return response.user;
}

export function signOut(): void {
  localStorage.removeItem(LocalStorageKey.Token);
  localStorage.removeItem(LocalStorageKey.User);
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(LocalStorageKey.User);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem(LocalStorageKey.Token);
}
