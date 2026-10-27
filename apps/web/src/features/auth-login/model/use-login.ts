'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from '@/entities/session';
import { ApiError } from '@/shared/api/client';
import { login } from '../api/login';
import { loginSchema, type LoginFormValues } from './schema';

// Логика формы входа: вызов API, сохранение сессии, редирект на /dashboard.
export function useLogin() {
	const router = useRouter();
	const { signIn } = useSession();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [rootError, setRootError] = useState<string | null>(null);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: '', password: '' },
	});

	async function onSubmit(values: LoginFormValues): Promise<void> {
		setIsSubmitting(true);
		setRootError(null);
		try {
			const auth = await login(values);
			signIn(auth);
			router.replace('/dashboard');
		} catch (error) {
			setRootError(error instanceof ApiError ? error.message : 'Не удалось выполнить вход');
		} finally {
			setIsSubmitting(false);
		}
	}

	return { form, onSubmit, isSubmitting, rootError };
}
