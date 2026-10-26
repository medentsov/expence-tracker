'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { Icon, type IconName } from '@/shared/ui/icon';

export const NAV_ITEMS: readonly { href: string; label: string; icon: IconName }[] = [
  { href: '/dashboard', label: 'Главная', icon: 'layout-dashboard' },
  { href: '/transactions', label: 'Транзакции', icon: 'wallet' },
  { href: '/categories', label: 'Категории', icon: 'tags' },
] as const;

// Содержимое навигации без обёртки — переиспользуется в сайдбаре и мобильном меню.
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2" aria-label="Основная навигация">
      <span className="px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
        Меню
      </span>
      <div className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300',
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/25 via-violet-500/10 to-transparent text-foreground ring-1 ring-inset ring-white/10'
                  : 'text-muted-foreground hover:translate-x-0.5 hover:bg-white/[0.04] hover:text-foreground',
              )}
            >
              <Icon
                name={item.icon}
                className={cn(
                  'size-5 transition-colors duration-300',
                  isActive ? 'text-primary' : 'text-ink-soft group-hover:text-foreground',
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function SidebarLogo({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/dashboard"
      onClick={onNavigate}
      className="flex items-center gap-3 px-2 font-display text-xl font-bold tracking-tight"
    >
      <span className="relative flex size-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-glow">
        <span className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <Icon name="wallet" className="relative size-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span>Трекер</span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft">
          finance
        </span>
      </span>
    </Link>
  );
}
