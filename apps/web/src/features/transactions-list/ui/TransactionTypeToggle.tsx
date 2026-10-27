'use client';

import { cn } from '@/shared/lib/utils';
import type { TransactionsTypeFilter } from '../model/types';

const OPTIONS: { value: TransactionsTypeFilter; label: string }[] = [
	{ value: 'ALL', label: 'Все' },
	{ value: 'INCOME', label: 'Доходы' },
	{ value: 'EXPENSE', label: 'Расходы' },
];

interface TransactionTypeToggleProps {
	value: TransactionsTypeFilter;
	onChange: (value: TransactionsTypeFilter) => void;
}

// Сегментированный переключатель типа операций. В отличие от селекта,
// все варианты видны сразу — это основной способ сузить список.
export function TransactionTypeToggle({ value, onChange }: TransactionTypeToggleProps) {
	return (
		<div
			role="group"
			aria-label="Тип транзакции"
			className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-secondary/50 p-1 backdrop-blur-xl"
		>
			{OPTIONS.map((option) => {
				const active = option.value === value;
				return (
					<button
						key={option.value}
						type="button"
						aria-pressed={active}
						onClick={() => onChange(option.value)}
						className={cn(
							'rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
							active
								? 'bg-primary text-primary-foreground shadow-glow'
								: 'text-muted-foreground hover:text-foreground',
						)}
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}
