'use client';

import type { Category, TransactionType } from '@tracker/shared';
import { useState } from 'react';
import { currentMonthRange } from '@/shared/lib/date';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

export interface TransactionsFilterValue {
	dateFrom: string;
	dateTo: string;
	/** '' — все типы, иначе конкретный. Radix Select не умеет пустую строку как значение. */
	type: TransactionType | 'ALL';
	/** '' — все категории. */
	categoryId: string;
}

export const EMPTY_FILTER: TransactionsFilterValue = {
	dateFrom: '',
	dateTo: '',
	type: 'ALL',
	categoryId: '',
};

interface TransactionsFilterBarProps {
	value: TransactionsFilterValue;
	onChange: (next: TransactionsFilterValue) => void;
	categories: Category[];
	categoriesLoading: boolean;
	/** Сколько фильтров активно — для счётчика на кнопке. */
	activeCount: number;
}

export function countActiveFilters(value: TransactionsFilterValue): number {
	let count = 0;
	if (value.dateFrom) count += 1;
	if (value.dateTo) count += 1;
	if (value.categoryId) count += 1;
	// Тип операции — постоянный переключатель над таблицей, а не поле панели,
	// поэтому в счётчике «Фильтров» он не участвует.
	return count;
}

// Значения-заглушки ('ALL', пустые строки) в запрос не уходят:
// API ждёт либо валидный параметр, либо его отсутствие.
export function toApiFilter(value: TransactionsFilterValue) {
	return {
		dateFrom: value.dateFrom || undefined,
		dateTo: value.dateTo || undefined,
		type: value.type === 'ALL' ? undefined : value.type,
		categoryId: value.categoryId || undefined,
	};
}

// Панель фильтров: раскрывается по кнопке, как «Filters» в референсе.
// Период, тип операции и категория — ровно те параметры, что принимает API.
export function TransactionsFilterBar({
	value,
	onChange,
	categories,
	categoriesLoading,
	activeCount,
}: TransactionsFilterBarProps) {
	const [open, setOpen] = useState(false);

	function patch(part: Partial<TransactionsFilterValue>): void {
		onChange({ ...value, ...part });
	}

	function reset(): void {
		onChange(EMPTY_FILTER);
	}

	function applyMonth(): void {
		onChange({ ...value, ...currentMonthRange() });
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<Button variant="secondary" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
					<Icon name="filter" className="size-4" />
					Фильтры
					{activeCount > 0 ? (
						<span className="ml-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
							{activeCount}
						</span>
					) : null}
				</Button>

				{activeCount > 0 ? (
					<Button variant="ghost" size="sm" onClick={reset}>
						<Icon name="x" className="size-4" />
						Сбросить
					</Button>
				) : null}
			</div>

			{open ? (
				<div className="grid gap-4 rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-3">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="filter-date-from">С даты</Label>
						<Input
							id="filter-date-from"
							type="date"
							value={value.dateFrom}
							max={value.dateTo || undefined}
							onChange={(e) => patch({ dateFrom: e.target.value })}
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor="filter-date-to">По дату</Label>
						<Input
							id="filter-date-to"
							type="date"
							value={value.dateTo}
							min={value.dateFrom || undefined}
							onChange={(e) => patch({ dateTo: e.target.value })}
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor="filter-category">Категория</Label>
						<Select
							value={value.categoryId || 'ALL'}
							onValueChange={(v) => patch({ categoryId: v === 'ALL' ? '' : v })}
							disabled={categoriesLoading}
						>
							<SelectTrigger id="filter-category" className="w-full">
								<SelectValue placeholder={categoriesLoading ? 'Загрузка…' : 'Все категории'} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ALL">Все категории</SelectItem>
								{categories.map((c) => (
									<SelectItem key={c.id} value={c.id}>
										{c.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="sm:col-span-2 lg:col-span-3">
						<Button variant="ghost" size="sm" onClick={applyMonth}>
							Текущий месяц
						</Button>
					</div>
				</div>
			) : null}
		</div>
	);
}
