'use client';

import { Icon } from '@/shared/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import type { TransactionsGrouping, TransactionsTypeFilter } from '../model/types';
import { TransactionTypeToggle } from './TransactionTypeToggle';

const GROUPING_LABELS: Record<TransactionsGrouping, string> = {
	none: 'Без группировки',
	date: 'По датам',
	category: 'По категориям',
};

interface TransactionsViewBarProps {
	type: TransactionsTypeFilter;
	onTypeChange: (type: TransactionsTypeFilter) => void;
	grouping: TransactionsGrouping;
	onGroupingChange: (grouping: TransactionsGrouping) => void;
}

// Управление видом списка: тип операций (уходит в API) и визуальная
// группировка по уже загруженной странице. Сортировка живёт в заголовках
// столбцов таблицы, поэтому здесь её нет.
export function TransactionsViewBar({ type, onTypeChange, grouping, onGroupingChange }: TransactionsViewBarProps) {
	return (
		<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
			<div className="flex items-center gap-2.5">
				<span className="text-sm font-medium text-muted-foreground">Тип транзакции</span>
				<TransactionTypeToggle value={type} onChange={onTypeChange} />
			</div>

			<div className="flex items-center gap-2.5">
				<span className="text-sm font-medium text-muted-foreground">Группировка</span>
				<Select value={grouping} onValueChange={(value) => onGroupingChange(value as TransactionsGrouping)}>
					<SelectTrigger className="w-[210px] text-sm">
						<Icon name="layers" className="size-4" />
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{(Object.keys(GROUPING_LABELS) as TransactionsGrouping[]).map((mode) => (
							<SelectItem key={mode} value={mode}>
								{GROUPING_LABELS[mode]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
