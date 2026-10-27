import type { Category } from './category';

// Тип транзакции: доход или расход.
export type TransactionType = 'INCOME' | 'EXPENSE';

// Транзакция пользователя (ответ API).
export interface Transaction {
	id: string;
	amount: number;
	type: TransactionType;
	description?: string | null;
	date: string;
	categoryId: string;
	category?: Category;
	createdAt: string;
	updatedAt: string;
}

// Входные данные для создания/обновления транзакции.
export interface TransactionInput {
	amount: number;
	type: TransactionType;
	description?: string;
	date: string;
	categoryId: string;
}

// Сводка доходов/расходов за месяц.
export interface TransactionsSummary {
	month: number;
	year: number;
	totalIncome: number;
	totalExpense: number;
	balance: number;
}
