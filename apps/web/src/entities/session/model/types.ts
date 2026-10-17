import type { AuthResponse, User } from '@tracker/shared';

// Статус сессии: пока идёт проверка токена при загрузке — 'loading'.
export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

// Полезная нагрузка JWT, которую отдаёт GET /auth/me (это НЕ объект User).
export interface MePayload {
  sub: string;
  email: string;
  name?: string;
}

export interface SessionContextValue {
  user: User | null;
  status: SessionStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Сохраняет сессию после успешного login/register.
  signIn: (auth: AuthResponse) => void;
  // Очищает сессию; навигацию выполняет вызывающий.
  signOut: () => void;
}
