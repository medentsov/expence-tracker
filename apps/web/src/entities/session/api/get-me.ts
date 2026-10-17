import { apiFetch } from '@/shared/api/client';
import type { MePayload } from '../model/types';

// Проверка токена и получение полезной нагрузки JWT (не полного User).
export function getMe(token: string): Promise<MePayload> {
  return apiFetch<MePayload>('/auth/me', { token });
}
