import type { Paginated, Transaction, TransactionType } from '@tracker/shared';
import { apiFetch } from '@/shared/api/client';

/** Поля сортировки, поддерживаемые API. */
export type TransactionSortField = 'name' | 'date' | 'amount' | 'category';

/** Направление сортировки. */
export type TransactionSortOrder = 'asc' | 'desc';

// Параметры фильтрации и сортировки списка. Бэкенд (`GetTransactionsQueryDto`)
// принимает dateFrom/dateTo/type/categoryId/sortBy/sortOrder — здесь они
// только пробрасываются.
export interface TransactionsFilter {
  dateFrom?: string;
  dateTo?: string;
  type?: TransactionType;
  categoryId?: string;
  sortBy?: TransactionSortField;
  sortOrder?: TransactionSortOrder;
}

interface ListTransactionsParams extends TransactionsFilter {
  page?: number;
  limit?: number;
}

// GET /transactions?… — постраничный список транзакций с фильтрами и сортировкой.
export function listTransactions(
  token: string,
  params: ListTransactionsParams = {},
): Promise<Paginated<Transaction>> {
  const sp = new URLSearchParams();
  if (params.page !== undefined) sp.set('page', String(params.page));
  if (params.limit !== undefined) sp.set('limit', String(params.limit));
  if (params.dateFrom) sp.set('dateFrom', params.dateFrom);
  if (params.dateTo) sp.set('dateTo', params.dateTo);
  if (params.type) sp.set('type', params.type);
  if (params.categoryId) sp.set('categoryId', params.categoryId);
  if (params.sortBy) sp.set('sortBy', params.sortBy);
  if (params.sortOrder) sp.set('sortOrder', params.sortOrder);
  const qs = sp.toString();
  return apiFetch<Paginated<Transaction>>(`/transactions${qs ? `?${qs}` : ''}`, { token });
}
