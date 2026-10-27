import type { Transaction } from '@tracker/shared';
import { apiFetch } from '@/shared/api/client';

// DELETE /transactions/:id — удаление транзакции текущего пользователя.
export function deleteTransaction(token: string, id: string): Promise<Transaction> {
	return apiFetch<Transaction>(`/transactions/${id}`, { method: 'DELETE', token });
}
