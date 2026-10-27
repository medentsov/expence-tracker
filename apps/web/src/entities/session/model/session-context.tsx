'use client';

import type { AuthResponse, User } from '@tracker/shared';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ApiError } from '@/shared/api/client';
import { getMe } from '../api/get-me';
import { clearCachedUser, clearToken, getCachedUser, getToken, setCachedUser, setToken } from './storage';
import type { SessionContextValue, SessionStatus } from './types';

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [status, setStatus] = useState<SessionStatus>('loading');

	// Восстановление сессии при загрузке: токен есть → валидируем его через /auth/me.
	useEffect(() => {
		const token = getToken();
		if (!token) {
			setStatus('unauthenticated');
			return;
		}

		let cancelled = false;

		getMe(token)
			.then((payload) => {
				if (cancelled) {
					return;
				}
				// Полный профиль берём из кэша (сохранён при login/register),
				// иначе восстанавливаем частичный объект из JWT-payload.
				const cached = getCachedUser();
				setUser(
					cached ?? {
						id: payload.sub,
						email: payload.email,
						name: payload.name ?? null,
						createdAt: '',
						updatedAt: '',
					},
				);
				setStatus('authenticated');
			})
			.catch((error: unknown) => {
				if (cancelled) {
					return;
				}
				// 401 → токен протух/невалиден; сетевой сбой (status 0) не сбрасываем,
				// чтобы не разлогинивать пользователя из-за временной недоступности API.
				if (error instanceof ApiError && error.status === 401) {
					clearToken();
					clearCachedUser();
					setUser(null);
					setStatus('unauthenticated');
				} else {
					setStatus('unauthenticated');
				}
			});

		return () => {
			cancelled = true;
		};
	}, []);

	const signIn = useCallback((auth: AuthResponse) => {
		setToken(auth.accessToken);
		setCachedUser(auth.user);
		setUser(auth.user);
		setStatus('authenticated');
	}, []);

	const signOut = useCallback(() => {
		clearToken();
		clearCachedUser();
		setUser(null);
		setStatus('unauthenticated');
	}, []);

	const value = useMemo<SessionContextValue>(
		() => ({
			user,
			status,
			isAuthenticated: status === 'authenticated',
			isLoading: status === 'loading',
			signIn,
			signOut,
		}),
		[user, status, signIn, signOut],
	);

	return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
	const context = useContext(SessionContext);
	if (!context) {
		throw new Error('useSession должен использоваться внутри SessionProvider');
	}
	return context;
}
