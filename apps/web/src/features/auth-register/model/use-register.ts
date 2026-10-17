'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from '@/entities/session';
import { ApiError } from '@/shared/api/client';
import { register } from '../api/register';
import { registerSchema, type RegisterFormValues } from './schema';

// Логика формы регистрации: создание пользователя, сохранение сессии, редирект на /dashboard.
export function useRegister() {
  const router = useRouter();
  const { signIn } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', name: '', agree: false },
  });

  async function onSubmit(values: RegisterFormValues): Promise<void> {
    setIsSubmitting(true);
    setRootError(null);
    try {
      const auth = await register({
        email: values.email,
        password: values.password,
        // Пустое имя не отправляем — на бэке `name` опционально (IsOptional).
        name: values.name?.trim() ? values.name.trim() : undefined,
      });
      signIn(auth);
      router.replace('/dashboard');
    } catch (error) {
      setRootError(error instanceof ApiError ? error.message : 'Не удалось зарегистрироваться');
    } finally {
      setIsSubmitting(false);
    }
  }

  return { form, onSubmit, isSubmitting, rootError };
}
