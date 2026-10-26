import type { Transaction, TransactionInput } from '@tracker/shared';
import { apiFetch } from '@/shared/api/client';

// PATCH /transactions/:id — частичное обновление транзакции.
export function updateTransaction(
  token: string,
  id: string,
  input: Partial<TransactionInput>,
): Promise<Transaction> {
  return apiFetch<Transaction>(`/transactions/${id}`, {
    method: 'PATCH',
    body: input,
    token,
  });
}
