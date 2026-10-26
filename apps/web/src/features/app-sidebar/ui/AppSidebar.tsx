'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from '@/shared/ui/icon';
import { SidebarLogo, SidebarNav } from './SidebarNav';

interface AppSidebarProps {
  /** Кнопка «Новая транзакция» — прокидывается извне, чтобы не тянуть features вверх. */
  createAction?: ReactNode;
}

// Фиксированный сайдбар десктопа. Живёт на общем фоне шелла,
// акцент — только в нижней стеклянной CTA-карточке.
export function AppSidebar({ createAction }: AppSidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col justify-between gap-8 px-4 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen">
      <div className="flex flex-col gap-10">
        <SidebarLogo />
        <SidebarNav />
      </div>

      {createAction ? (
        <div className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-transparent p-5 backdrop-blur-xl">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -right-10 -top-12 size-32 rounded-full bg-fuchsia-500/20 blur-2xl" />
            <div className="absolute -bottom-12 -left-8 size-28 rounded-full bg-indigo-500/20 blur-2xl" />
          </div>

          <div className="flex items-center justify-between">
            <span className="flex size-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-foreground">
              <Icon name="arrow-up-right" className="size-4" />
            </span>
            <span className="rounded-full border border-border/60 bg-background/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              быстро
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-1">
            <p className="font-display text-sm font-semibold">Новая запись</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Запишите доход или расход — сводка обновится сразу.
            </p>
          </div>
          <div className="mt-4 [&_button]:w-full">{createAction}</div>
        </div>
      ) : (
        <Link
          href="/transactions"
          className="text-xs text-ink-soft transition-colors hover:text-foreground"
        >
          Все операции
        </Link>
      )}
    </aside>
  );
}
