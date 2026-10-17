import { API_URL } from '@/shared/config/env';
import { extractMessage } from './types';

// Ошибка обращения к API: несёт HTTP-статус и разобранное тело ответа,
// чтобы UI мог различать сценарии (401, 409 и т.п.).
export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  // Bearer-токен передаётся явно — слой shared не знает про хранилище сессии.
  token?: string;
  signal?: AbortSignal;
}

// Типизированный fetch к NestJS API: JSON-заголовки, Bearer-токен,
// разбор ошибок в ApiError, 204 → undefined.
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body, token, signal } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch {
    // Сетевой сбой (API недоступен, CORS и т.п.).
    throw new ApiError('Не удалось связаться с сервером', 0);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(extractMessage(payload), response.status, payload);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
