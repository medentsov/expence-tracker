import type { TransactionType } from '@tracker/shared';

// Минимальная модель транзакции для формы редактирования: только поля,
// которые реально участвуют в PATCH-запросе.
export interface EditableTransaction {
	readonly id: string;
	readonly amount: number;
	readonly type: TransactionType;
	readonly description: string | null;
	readonly date: string;
	readonly categoryId: string;
}
