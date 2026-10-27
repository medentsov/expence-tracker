'use client';

import { useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import {
	CreateTransactionButton,
	EditTransactionDialog,
	useCategories,
	type EditableTransaction,
} from '@/features/transaction-create';
import {
	TransactionsList,
	TransactionsViewBar,
	useTransactions,
	type TransactionsGrouping,
	type TransactionsSort,
	type TransactionsTypeFilter,
} from '@/features/transactions-list';
import {
	TransactionsFilterBar,
	EMPTY_FILTER,
	countActiveFilters,
	toApiFilter,
	type TransactionsFilterValue,
} from '@/features/transactions-filter';

const DEFAULT_SORT: TransactionsSort = { field: 'date', order: 'desc' };

// Подпись под заголовком должна объяснять текущий порядок, иначе
// «сначала новые» врёт при сортировке по сумме или категории.
function sortDescription({ field, order }: TransactionsSort): string {
	if (field === 'amount') {
		return order === 'desc' ? 'сначала крупные суммы' : 'сначала небольшие суммы';
	}
	if (field === 'category') {
		return order === 'asc' ? 'по категориям А–Я' : 'по категориям Я–А';
	}
	if (field === 'name') {
		return order === 'asc' ? 'по названию А–Я' : 'по названию Я–А';
	}
	return order === 'desc' ? 'сначала новые' : 'сначала старые';
}

// Главная передаёт тип операции в query-параметре: /transactions?type=INCOME.
function toTypeFilter(value?: string): TransactionsTypeFilter {
	return value === 'INCOME' || value === 'EXPENSE' ? value : 'ALL';
}

interface TransactionsPageProps {
	/** Начальный тип операций из URL (переход с главной по «Доходы»/«Расходы»). */
	initialType?: string;
}

// Полный список операций с фильтрами, типом, сортировкой и группировкой.
export function TransactionsPage({ initialType }: TransactionsPageProps) {
	const [filter, setFilter] = useState<TransactionsFilterValue>(() => ({
		...EMPTY_FILTER,
		type: toTypeFilter(initialType),
	}));
	const [sort, setSort] = useState<TransactionsSort>(DEFAULT_SORT);
	const [grouping, setGrouping] = useState<TransactionsGrouping>('none');
	const [selected, setSelected] = useState<EditableTransaction | null>(null);
	// Категории нужны только для селекта; грузим сразу, экран без них неполон.
	const { categories, loading: categoriesLoading } = useCategories(true);

	const apiFilter = useMemo(
		() => ({
			...toApiFilter(filter),
			sortBy: sort.field,
			sortOrder: sort.order,
		}),
		[filter, sort],
	);
	const transactions = useTransactions(apiFilter);
	const { refetch } = transactions;

	const activeCount = countActiveFilters(filter);
	// Тип операции живёт вне панели «Фильтры», но тоже сужает выборку.
	const isNarrowed = activeCount > 0 || filter.type !== 'ALL';

	const handleChanged = useCallback(() => {
		refetch();
	}, [refetch]);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="flex flex-col gap-2">
					<span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-card/50 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-xl">
						<span className="size-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
						История операций
					</span>
					<h1 className="bg-gradient-to-r from-foreground via-foreground to-foreground/55 bg-clip-text font-display text-3xl font-bold tracking-tight text-transparent lg:text-4xl">
						Транзакции
					</h1>
					<p className="text-sm text-muted-foreground">Все ваши доходы и расходы</p>
				</div>
				<CreateTransactionButton onCreated={handleChanged} />
			</div>

			<TransactionsFilterBar
				value={filter}
				onChange={setFilter}
				categories={categories}
				categoriesLoading={categoriesLoading}
				activeCount={activeCount}
			/>

			<Card>
				<CardHeader className="gap-4">
					<div className="flex flex-col gap-1.5">
						<CardTitle>Операции</CardTitle>
						<CardDescription>
							10 записей на страницу
							{activeCount > 0 ? ', с учётом фильтров' : ''} · {sortDescription(sort)}
						</CardDescription>
					</div>
					<TransactionsViewBar
						type={filter.type}
						onTypeChange={(type) => setFilter((prev) => ({ ...prev, type }))}
						grouping={grouping}
						onGroupingChange={setGrouping}
					/>
				</CardHeader>
				<CardContent>
					<TransactionsList
						data={transactions.data}
						loading={transactions.loading}
						error={transactions.error}
						page={transactions.page}
						totalPages={transactions.totalPages}
						total={transactions.total}
						setPage={transactions.setPage}
						onSelect={setSelected}
						grouping={grouping}
						sort={sort}
						onSortChange={setSort}
						emptyTitle={isNarrowed ? 'Ничего не найдено' : 'Операций пока нет'}
						emptyDescription={
							isNarrowed
								? 'Под выбранные условия не подошла ни одна операция. Попробуйте изменить тип, фильтры или группировку.'
								: 'Добавьте первый доход или расход — он появится в этом списке.'
						}
						emptyAction={
							isNarrowed ? (
								<a
									href="#"
									onClick={(e) => {
										e.preventDefault();
										setFilter(EMPTY_FILTER);
									}}
									className="text-sm font-medium text-foreground underline underline-offset-4"
								>
									Сбросить условия
								</a>
							) : (
								<CreateTransactionButton onCreated={handleChanged} />
							)
						}
					/>
				</CardContent>
			</Card>

			<EditTransactionDialog transaction={selected} onClose={() => setSelected(null)} onUpdated={handleChanged} />
		</div>
	);
}
