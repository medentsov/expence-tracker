'use client';

import type { TransactionsSummary } from '@tracker/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getTransactionsSummary } from '@/entities/transaction';
import { getToken } from '@/entities/session';
import { ApiError } from '@/shared/api/client';

interface UseSummaryResult {
	data: TransactionsSummary | null;
	loading: boolean;
	error: string | null;
	refetch: () => void;
}

export function useSummary(): UseSummaryResult {
	const [data, setData] = useState<TransactionsSummary | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Период фиксируем при монтировании: сводка не «перескакивает» на новый месяц,
	// если вкладка открыта через полночь, а refetch перезапрашивает тот же период.
	const periodRef = useRef<{ month: number; year: number } | null>(null);
	if (periodRef.current === null) {
		const now = new Date();
		periodRef.current = { month: now.getMonth() + 1, year: now.getFullYear() };
	}

	const fetch = useCallback(() => {
		const token = getToken();
		if (!token) {
			setLoading(false);
			setError('Нет токена');
			return;
		}

		setLoading(true);
		setError(null);

		const period = periodRef.current!;
		getTransactionsSummary(token, period)
			.then(setData)
			.catch((err: unknown) => {
				setError(err instanceof ApiError ? err.message : 'Не удалось загрузить сводку');
			})
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		fetch();
	}, [fetch]);

	return { data, loading, error, refetch: fetch };
}
