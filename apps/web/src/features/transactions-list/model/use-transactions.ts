'use client';

import type { Paginated, Transaction } from '@tracker/shared';
import { useCallback, useEffect, useState } from 'react';
import { getToken } from '@/entities/session';
import { listTransactions } from '@/entities/transaction';
import { ApiError } from '@/shared/api/client';

const PAGE_SIZE = 10;

interface UseTransactionsResult {
  data: Paginated<Transaction> | null;
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
  setPage: (page: number) => void;
  refetch: () => void;
}

export function useTransactions(): UseTransactionsResult {
  const [data, setData] = useState<Paginated<Transaction> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPageState] = useState(1);

  const fetch = useCallback(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      setError('Нет токена');
      return;
    }

    setLoading(true);
    setError(null);

    listTransactions(token, { page, limit: PAGE_SIZE })
      .then(setData)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Не удалось загрузить транзакции');
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Если данных стало меньше (удаление/фильтр) и текущая страница вышла за пределы —
  // возвращаемся на последнюю существующую.
  useEffect(() => {
    if (data && data.items.length === 0 && page > totalPages) {
      setPageState(totalPages);
    }
  }, [data, page, totalPages]);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  return { data, loading, error, page, totalPages, total, setPage, refetch: fetch };
}