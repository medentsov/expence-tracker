'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useSession } from '@/entities/session';
import { AppHeader } from '@/features/app-header';

// Group-layout приватных страниц: пока идёт проверка токена — спиннер,
// если сессии нет — редирект на /login. Общая шапка с меню и профилем.
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [router, status]);

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center p-4 text-muted-foreground">
        Загрузка…
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 p-4">{children}</main>
    </div>
  );
}