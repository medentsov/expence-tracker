import type { Transaction, TransactionInput } from '@tracker/shared';
import { apiFetch } from '@/shared/api/client';

// POST /transactions — создание транзакции.
export function createTransaction(token: string, input: TransactionInput): Promise<Transaction> {
  return apiFetch<Transaction>('/transactions', { method: 'POST', body: input, token });
}
