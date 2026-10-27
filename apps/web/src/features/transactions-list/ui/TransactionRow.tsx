'use client';

import { cn } from '@/shared/lib/utils';
import { formatDate, formatMoney } from '@/shared/lib/format';
import { Icon, iconForCategory } from '@/shared/ui/icon';
import type { Transaction } from '../model/types';

interface TransactionRowProps {
	transaction: Transaction;
	/** Клик по строке открывает редактирование. */
	onSelect?: (transaction: Transaction) => void;
}

// Строка таблицы операций. На узких экранах категория и дата переезжают
// под наименование, чтобы таблица не превращалась в горизонтальный скролл.
export function TransactionRow({ transaction, onSelect }: TransactionRowProps) {
	const isIncome = transaction.type === 'INCOME';
	const categoryName = transaction.category?.name;
	const title = transaction.description || categoryName || 'Без описания';
	const color = transaction.category?.color ?? (isIncome ? '#34d399' : '#818cf8');
	const icon = iconForCategory(categoryName);

	const nameContent = (
		<>
			{/* Иконка подбирается по названию категории; цвет берётся из справочника. */}
			<span
				className="relative flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
				style={{
					color,
					backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)`,
					boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 32%, transparent)`,
				}}
				aria-hidden
			>
				<Icon name={icon} className="size-4.5" />
			</span>

			<span className="flex min-w-0 flex-col">
				<span className="truncate text-sm font-medium text-foreground">{title}</span>
				<span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground sm:hidden">
					<span className="truncate">{categoryName ?? 'Без категории'}</span>
					<span className="size-1 shrink-0 rounded-full bg-current opacity-40" />
					<span className="shrink-0 tabular-nums">{formatDate(transaction.date)}</span>
				</span>
			</span>
		</>
	);

	const nameClassName =
		'flex w-full min-w-0 items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50';

	return (
		<tr
			className={cn(
				'group transition-colors duration-300',
				onSelect && 'cursor-pointer hover:bg-foreground/[0.04]',
			)}
			onClick={onSelect ? () => onSelect(transaction) : undefined}
		>
			<td className="py-2.5 pr-3 pl-1 align-middle">
				{onSelect ? (
					<button
						type="button"
						className={nameClassName}
						onClick={(event) => {
							// Клик по названию не должен срабатывать дважды из-за onClick строки.
							event.stopPropagation();
							onSelect(transaction);
						}}
					>
						{nameContent}
					</button>
				) : (
					<div className={nameClassName}>{nameContent}</div>
				)}
			</td>

			<td className="hidden px-3 py-2.5 align-middle text-sm text-muted-foreground sm:table-cell">
				<span className="flex min-w-0 items-center gap-2">
					<span aria-hidden className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
					<span className="truncate">{categoryName ?? 'Без категории'}</span>
				</span>
			</td>

			<td className="hidden px-3 py-2.5 align-middle text-sm whitespace-nowrap text-muted-foreground tabular-nums sm:table-cell">
				{formatDate(transaction.date)}
			</td>

			<td className="py-2.5 pr-1 pl-3 text-right align-middle">
				<div className="flex flex-col items-end gap-0.5">
					<span
						className={cn(
							'font-display text-sm font-semibold whitespace-nowrap tabular-nums',
							isIncome ? 'text-positive' : 'text-negative',
						)}
					>
						{isIncome ? '+' : '−'}
						{formatMoney(transaction.amount)}
					</span>
					<span
						className={cn(
							'text-[10px] font-medium uppercase tracking-[0.12em]',
							isIncome ? 'text-positive/70' : 'text-muted-foreground/80',
						)}
					>
						{isIncome ? 'Доход' : 'Расход'}
					</span>
				</div>
			</td>
		</tr>
	);
}
