import type { Paginated, Transaction } from '@tracker/shared';
import { apiFetch } from '@/shared/api/client';

interface ListTransactionsParams {
  page?: number;
  limit?: number;
}

// GET /transactions?page=…&limit=… — постраничный список транзакций.
export function listTransactions(
  token: string,
  params: ListTransactionsParams = {},
): Promise<Paginated<Transaction>> {
  const sp = new URLSearchParams();
  if (params.page !== undefined) sp.set('page', String(params.page));
  if (params.limit !== undefined) sp.set('limit', String(params.limit));
  const qs = sp.toString();
  return apiFetch<Paginated<Transaction>>(`/transactions${qs ? `?${qs}` : ''}`, { token });
}