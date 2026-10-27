'use client';

import type { TransactionsSummary } from '@tracker/shared';
import { cn } from '@/shared/lib/utils';
import { formatMoney, formatMonth } from '@/shared/lib/format';
import { Icon, type IconName } from '@/shared/ui/icon';
import { Skeleton } from '@/shared/ui/skeleton';
import { BalanceCard } from './BalanceCard';
import { toWalletStats, type WalletStats } from '../model/types';

interface SummaryCardsProps {
	data: TransactionsSummary | null;
	loading: boolean;
	error: string | null;
}

interface MetricCardProps {
	label: string;
	value: string;
	hint: string;
	icon: IconName;
	tone: 'emerald' | 'rose';
	share: number;
	loading: boolean;
}

const TONES = {
	emerald: {
		icon: 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/20',
		bar: 'from-emerald-400 to-teal-300',
		glow: 'bg-emerald-400/10',
		value: 'text-positive',
	},
	rose: {
		icon: 'bg-rose-400/15 text-rose-300 ring-rose-400/20',
		bar: 'from-rose-400 to-fuchsia-400',
		glow: 'bg-rose-400/10',
		value: 'text-negative',
	},
} as const;

function MetricCard({ label, value, hint, icon, tone, share, loading }: MetricCardProps) {
	const styles = TONES[tone];

	return (
		<article className="group relative isolate overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/60 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20">
			<div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
				<div className={cn('absolute -right-10 -top-12 size-40 rounded-full blur-3xl', styles.glow)} />
			</div>

			<div className="flex items-center justify-between gap-3">
				<span
					className={cn(
						'flex size-10 items-center justify-center rounded-2xl ring-1 ring-inset',
						styles.icon,
					)}
				>
					<Icon name={icon} className="size-5" />
				</span>
				<span className="rounded-full border border-border/70 bg-background/40 px-2.5 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
					{hint}
				</span>
			</div>

			<div className="mt-6 flex flex-col gap-1">
				<span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
				{loading ? (
					<Skeleton className="h-8 w-32 bg-foreground/10" />
				) : (
					<span
						className={cn(
							'font-display text-2xl font-bold tracking-tight tabular-nums lg:text-[1.75rem]',
							styles.value,
						)}
					>
						{value}
					</span>
				)}
			</div>

			<div className="mt-5 flex items-center gap-3">
				<div className="h-1 flex-1 overflow-hidden rounded-full bg-foreground/10">
					<div
						className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', styles.bar)}
						style={{ width: `${share}%` }}
					/>
				</div>
				<span className="text-[11px] tabular-nums text-muted-foreground">{share}%</span>
			</div>
		</article>
	);
}

export function SummaryCards({ data, loading, error }: SummaryCardsProps) {
	const stats: WalletStats | null = toWalletStats(data);

	if (error) {
		return (
			<div
				role="alert"
				className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive backdrop-blur-xl"
			>
				<Icon name="warning" className="size-4" />
				Не удалось загрузить сводку: {error}
			</div>
		);
	}

	const monthLabel = stats ? formatMonth(stats.month, stats.year) : 'Текущий месяц';
	const income = stats?.totalIncome ?? 0;
	const expense = stats?.totalExpense ?? 0;
	const turnover = income + expense;
	const incomeShare = turnover > 0 ? Math.round((income / turnover) * 100) : 0;
	const expenseShare = turnover > 0 ? 100 - incomeShare : 0;

	return (
		<div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
			<BalanceCard stats={stats} loading={loading} />

			<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
				<MetricCard
					label="Доходы"
					value={`+${formatMoney(income)}`}
					hint={monthLabel}
					icon="trending-up"
					tone="emerald"
					share={incomeShare}
					loading={loading}
				/>
				<MetricCard
					label="Расходы"
					value={`−${formatMoney(expense)}`}
					hint={monthLabel}
					icon="trending-down"
					tone="rose"
					share={expenseShare}
					loading={loading}
				/>
			</div>
		</div>
	);
}
