'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useSession } from '@/entities/session';

// Group-layout приватных страниц: пока идёт проверка токена — спиннер,
// если сессии нет — редирект на /login.
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
    <main className="flex min-h-screen items-center justify-center p-4">
      {children}
    </main>
  );
}