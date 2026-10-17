import type { AuthResponse, RegisterInput } from '@tracker/shared';
import { apiFetch } from '@/shared/api/client';

// POST /auth/register — создание пользователя.
export function register(input: RegisterInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: input });
}
