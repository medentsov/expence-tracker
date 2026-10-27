import type { CurrencyCode } from './currency';
import type { Category } from './category';

// Единичный расход (ответ API).
export interface Expense {
	id: string;
	amount: number;
	currency: CurrencyCode;
	note?: string | null;
	date: string;
	categoryId: string;
	category?: Category;
	createdAt: string;
	updatedAt: string;
}

// Входные данные для создания расхода.
export interface ExpenseInput {
	amount: number;
	currency?: CurrencyCode;
	note?: string;
	date?: string;
	categoryId: string;
}
