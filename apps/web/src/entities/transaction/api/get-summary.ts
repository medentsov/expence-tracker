import type { TransactionsSummary } from '@tracker/shared';
import { apiFetch } from '@/shared/api/client';

interface SummaryParams {
	month: number;
	year: number;
}

// GET /transactions/summary?month=…&year=… — сводка доходов/расходов за месяц.
export function getTransactionsSummary(token: string, params: SummaryParams): Promise<TransactionsSummary> {
	const sp = new URLSearchParams();
	sp.set('month', String(params.month));
	sp.set('year', String(params.year));
	return apiFetch<TransactionsSummary>(`/transactions/summary?${sp.toString()}`, { token });
}
