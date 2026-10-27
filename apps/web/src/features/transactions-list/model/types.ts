import type { Transaction as ApiTransaction, TransactionType } from '@tracker/shared';

export interface TransactionCategory {
	readonly id: string;
	readonly name: string;
	readonly color: string | null;
	readonly icon: string | null;
}

// Строгая модель строки списка: только то, что реально нужно для отрисовки.
export interface Transaction {
	readonly id: string;
	readonly amount: number;
	readonly type: TransactionType;
	readonly description: string | null;
	readonly date: string;
	readonly categoryId: string;
	readonly category: TransactionCategory | null;
}

export function toTransaction(transaction: ApiTransaction): Transaction {
	return {
		id: transaction.id,
		amount: transaction.amount,
		type: transaction.type,
		description: transaction.description ?? null,
		date: transaction.date,
		categoryId: transaction.categoryId,
		category: transaction.category
			? {
					id: transaction.category.id,
					name: transaction.category.name,
					color: transaction.category.color ?? null,
					icon: transaction.category.icon ?? null,
				}
			: null,
	};
}

/** Режим визуальной группировки списка операций. */
export type TransactionsGrouping = 'none' | 'date' | 'category';

/** Поле сортировки списка (совпадает с параметром API `sortBy`). */
export type TransactionsSortField = 'name' | 'date' | 'amount' | 'category';

/** Направление сортировки (совпадает с параметром API `sortOrder`). */
export type TransactionsSortOrder = 'asc' | 'desc';

/** Фильтр по типу операции: оба типа, только доходы или только расходы. */
export type TransactionsTypeFilter = 'ALL' | 'INCOME' | 'EXPENSE';

export interface TransactionsSort {
	readonly field: TransactionsSortField;
	readonly order: TransactionsSortOrder;
}

/** Группа операций для визуального заголовка. */
export interface TransactionGroup {
	readonly key: string;
	readonly label: string;
	readonly color: string | null;
	/** Знаковая сумма: доходы «+», расходы «−». */
	readonly total: number;
	readonly items: Transaction[];
}
