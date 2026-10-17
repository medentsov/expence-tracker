'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useSession } from '@/entities/session';

// Group-layout публичных форм: центрированная карточка.
// Если пользователь уже авторизован — уводим на /dashboard.
export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [router, status]);

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      {children}
    </main>
  );
}