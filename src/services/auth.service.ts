/**
 * Auth Service
 * Endpoints: POST /auth/register, /auth/login, /auth/refresh, /auth/logout, /auth/logout-all
 */

import { apiGet, apiPost, apiDelete } from "@/lib/api/http-client";
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
} from "@/types";

export interface ActiveSession {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
}

export const authService = {
  register: (dto: RegisterDto): Promise<AuthResponse> =>
    apiPost<AuthResponse>("/auth/register", dto),

  login: (dto: LoginDto): Promise<AuthResponse> =>
    apiPost<AuthResponse>("/auth/login", dto),

  refresh: (dto: RefreshTokenDto): Promise<AuthResponse> =>
    apiPost<AuthResponse>("/auth/refresh", dto),

  logout: (dto: RefreshTokenDto): Promise<void> =>
    apiPost<void>("/auth/logout", dto),

  logoutAll: (): Promise<void> => apiPost<void>("/auth/logout-all"),

  listSessions: (): Promise<ActiveSession[]> =>
    apiGet<ActiveSession[]>("/auth/sessions"),

  revokeSession: (sessionId: string): Promise<void> =>
    apiDelete<void>(`/auth/sessions/${encodeURIComponent(sessionId)}`),
};
