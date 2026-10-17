'use client';

import { LayoutDashboard, LogOut, Tags, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/entities/session';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Главная', icon: LayoutDashboard },
  { href: '/transactions', label: 'Транзакции', icon: Wallet },
  { href: '/categories', label: 'Категории', icon: Tags },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useSession();

  const displayName = user?.name?.trim() || user?.email || 'Профиль';
  const initial = displayName.charAt(0).toUpperCase();

  function handleSignOut(): void {
    signOut();
    router.replace('/login');
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
        {/* Логотип / на главную */}
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Wallet className="size-5 text-primary" />
          <span className="hidden sm:inline">Трекер</span>
        </Link>

        {/* Меню */}
        <nav className="flex flex-1 items-center gap-1" aria-label="Основная навигация">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Профиль */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {initial}
              </span>
              <span className="hidden max-w-40 truncate text-sm sm:inline">{displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="truncate text-sm font-medium">{displayName}</span>
                {user?.email && user.name ? (
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                ) : null}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut} variant="destructive">
              <LogOut className="size-4" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}