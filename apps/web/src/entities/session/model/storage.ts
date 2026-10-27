import type { User } from '@tracker/shared';

const TOKEN_KEY = 'tracker.accessToken';
const USER_KEY = 'tracker.user';

// SSR-safe проверка: на сервере window/localStorage недоступны.
function hasStorage(): boolean {
	return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getToken(): string | null {
	return hasStorage() ? window.localStorage.getItem(TOKEN_KEY) : null;
}

export function setToken(token: string): void {
	if (hasStorage()) {
		window.localStorage.setItem(TOKEN_KEY, token);
	}
}

export function clearToken(): void {
	if (hasStorage()) {
		window.localStorage.removeItem(TOKEN_KEY);
	}
}

// Кэш полного User: GET /auth/me отдаёт лишь JWT-payload, поэтому профиль
// сохраняем из ответа login/register, чтобы восстановить его после перезагрузки.
export function getCachedUser(): User | null {
	if (!hasStorage()) {
		return null;
	}
	const raw = window.localStorage.getItem(USER_KEY);
	if (!raw) {
		return null;
	}
	try {
		return JSON.parse(raw) as User;
	} catch {
		return null;
	}
}

export function setCachedUser(user: User): void {
	if (hasStorage()) {
		window.localStorage.setItem(USER_KEY, JSON.stringify(user));
	}
}

export function clearCachedUser(): void {
	if (hasStorage()) {
		window.localStorage.removeItem(USER_KEY);
	}
}
