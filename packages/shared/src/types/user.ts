// Пользователь трекера (публичный профиль, без хэша пароля).
export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

// Ответ API на успешный вход/регистрацию: JWT и профиль пользователя.
export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Входные данные для регистрации.
export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

// Входные данные для входа.
export interface LoginInput {
  email: string;
  password: string;
}
