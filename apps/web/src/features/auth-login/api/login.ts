import type { AuthResponse, LoginInput } from '@tracker/shared';
import { apiFetch } from '@/shared/api/client';

// POST /auth/login — вход по email и паролю.
export function login(input: LoginInput): Promise<AuthResponse> {
	return apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: input });
}
