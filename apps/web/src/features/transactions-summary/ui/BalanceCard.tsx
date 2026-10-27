'use client';

import Link from 'next/link';
import { cn } from '@/shared/lib/utils';
import { formatMoney, formatMonth } from '@/shared/lib/format';
import { Icon } from '@/shared/ui/icon';
import { Skeleton } from '@/shared/ui/skeleton';
import type { WalletStats } from '../model/types';

interface BalanceCardProps {
	stats: WalletStats | null;
	loading?: boolean;
	className?: string;
}

const MESH_GRID =
	'linear-gradient(var(--balance-grid-line) 1px, transparent 1px),' +
	'linear-gradient(90deg, var(--balance-grid-line) 1px, transparent 1px)';

// Главная карточка дашборда: mesh-градиент, стеклянные слои и реальные
// цифры сводки. Палитра приходит из CSS-переменных `--balance-*`, поэтому
// карточка одинаково уместна и в тёмной, и в светлой теме.
export function BalanceCard({ stats, loading = false, className }: BalanceCardProps) {
	const monthLabel = stats ? formatMonth(stats.month, stats.year) : 'Текущий месяц';
	const income = stats?.totalIncome ?? 0;
	const expense = stats?.totalExpense ?? 0;
	const balance = stats?.balance ?? 0;
	const expenseShare = income > 0 ? Math.min(100, Math.round((expense / income) * 100)) : 0;

	return (
		<section
			className={cn(
				'group relative isolate overflow-hidden rounded-[2rem] p-6 text-[var(--balance-foreground)] ring-1 ring-[var(--balance-glass-border)]',
				'shadow-[var(--balance-shadow)] transition-transform duration-500 hover:-translate-y-1',
				'sm:p-8',
				className,
			)}
			style={{ backgroundImage: 'var(--balance-mesh)' }}
		>
			{/* Светящиеся пятна mesh-градиента */}
			<div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
				<div className="absolute -left-24 -top-28 size-80 rounded-full bg-[var(--balance-blob-1)] blur-3xl" />
				<div className="absolute -right-16 top-6 size-72 rounded-full bg-[var(--balance-blob-2)] blur-3xl" />
				<div className="absolute -bottom-32 left-1/3 size-80 rounded-full bg-[var(--balance-blob-3)] blur-3xl" />
				<div
					className="absolute inset-0 opacity-70"
					style={{
						backgroundImage: MESH_GRID,
						backgroundSize: '42px 42px',
						maskImage: 'radial-gradient(ellipse at 50% 40%, black 10%, transparent 72%)',
						WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 10%, transparent 72%)',
					}}
				/>
			</div>

			<div className="relative flex items-start justify-between gap-4">
				<div className="flex items-center gap-3.5">
					<span className="flex size-11 items-center justify-center rounded-2xl border border-[var(--balance-glass-border)] bg-[var(--balance-glass)] backdrop-blur-md">
						<Icon name="wallet" className="size-5" />
					</span>
					<div className="flex flex-col gap-0.5">
						<span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--balance-muted)]">
							Текущий баланс
						</span>
						<span className="text-sm text-[var(--balance-muted)]">Все счета · {monthLabel}</span>
					</div>
				</div>

				<span className="hidden items-center gap-1.5 rounded-full border border-[var(--balance-glass-border)] bg-[var(--balance-glass)] px-3 py-1.5 text-[11px] font-medium backdrop-blur-md sm:inline-flex">
					<span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
					RUB
				</span>
			</div>

			<div className="relative mt-9 flex flex-col gap-2">
				{loading ? (
					<Skeleton className="h-12 w-60 bg-[var(--balance-skeleton)] sm:h-14" />
				) : (
					<p className="font-display text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
						{formatMoney(balance)}
					</p>
				)}
				<p className="text-xs text-[var(--balance-muted)]">Итог за текущий период по всем операциям</p>
			</div>

			<div className="relative mt-8 grid gap-3 sm:grid-cols-2">
				<Link
					href="/transactions?type=INCOME"
					className="group/tile flex items-center gap-3 rounded-2xl border border-[var(--balance-glass-border)] bg-[var(--balance-glass)] p-3.5 backdrop-blur-md transition-all duration-300 hover:bg-[var(--balance-glass-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
				>
					<span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200">
						<Icon name="arrow-down-left" className="size-4" />
					</span>
					<div className="flex min-w-0 flex-col">
						<span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--balance-muted)]">
							Доходы
						</span>
						{loading ? (
							<Skeleton className="mt-1 h-4 w-24 bg-[var(--balance-skeleton)]" />
						) : (
							<span className="truncate font-display text-base font-semibold tabular-nums">
								+{formatMoney(income)}
							</span>
						)}
					</div>
					<Icon
						name="chevron-right"
						className="ml-auto size-4 shrink-0 opacity-0 transition-all duration-300 group-hover/tile:translate-x-0.5 group-hover/tile:opacity-70"
					/>
				</Link>

				<Link
					href="/transactions?type=EXPENSE"
					className="group/tile flex items-center gap-3 rounded-2xl border border-[var(--balance-glass-border)] bg-[var(--balance-glass)] p-3.5 backdrop-blur-md transition-all duration-300 hover:bg-[var(--balance-glass-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
				>
					<span className="flex size-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-700 dark:bg-rose-400/20 dark:text-rose-200">
						<Icon name="arrow-up-right" className="size-4" />
					</span>
					<div className="flex min-w-0 flex-col">
						<span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--balance-muted)]">
							Расходы
						</span>
						{loading ? (
							<Skeleton className="mt-1 h-4 w-24 bg-[var(--balance-skeleton)]" />
						) : (
							<span className="truncate font-display text-base font-semibold tabular-nums">
								−{formatMoney(expense)}
							</span>
						)}
					</div>
					<Icon
						name="chevron-right"
						className="ml-auto size-4 shrink-0 opacity-0 transition-all duration-300 group-hover/tile:translate-x-0.5 group-hover/tile:opacity-70"
					/>
				</Link>
			</div>

			<div className="relative mt-6 flex items-center gap-3">
				<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--balance-track)]">
					<div
						className="h-full rounded-full bg-gradient-to-r from-rose-400 via-fuchsia-400 to-violet-400 dark:from-rose-300 dark:via-fuchsia-300 dark:to-violet-300 transition-all duration-700 ease-out"
						style={{ width: `${loading ? 0 : expenseShare}%` }}
					/>
				</div>
				<span className="shrink-0 text-[11px] tabular-nums text-[var(--balance-muted)]">
					{loading
						? 'Считаем пропорции…'
						: income > 0
							? `Расходы ${expenseShare}% от доходов`
							: 'Нет доходов за период'}
				</span>
			</div>
		</section>
	);
}
