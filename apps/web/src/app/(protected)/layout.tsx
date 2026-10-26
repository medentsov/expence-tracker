'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useSession } from '@/entities/session';
import { CreateTransactionButton } from '@/features/transaction-create';
import { AppSidebar, MobileSidebar, Topbar } from '@/features/app-sidebar';

// Group-layout приватных страниц: пока идёт проверка токена — спиннер,
// если сессии нет — редирект на /login. Шелл: глубокий фон, стеклянная
// панель контента и сайдбар с навигацией.
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
        <span className="flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 py-2 text-sm backdrop-blur-xl">
          <span className="size-2 animate-pulse rounded-full bg-primary" />
          Загрузка…
        </span>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  // Кнопку создания показываем и в сайдбаре, и в мобильном меню — но не на страницах,
  // где она уже есть в заголовке. Без onCreated: список обновится при переходе.
  const sidebarCreate = <CreateTransactionButton />;

  return (
    <div className="flex min-h-screen bg-transparent">
      <AppSidebar createAction={sidebarCreate} />

      <div className="flex min-w-0 flex-1 flex-col lg:p-3 lg:pl-0">
        <div className="relative flex flex-1 flex-col overflow-hidden border-border/60 bg-surface/70 shadow-panel backdrop-blur-2xl lg:rounded-[2rem] lg:border">
          <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border/50 bg-surface/40 px-4 py-3 backdrop-blur-xl lg:px-8 lg:py-4">
            <MobileSidebar createAction={sidebarCreate} />
            <div className="flex-1" />
            <Topbar />
          </header>

          <main className="min-w-0 flex-1 px-4 pt-5 pb-6 lg:px-8 lg:pt-7 lg:pb-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
