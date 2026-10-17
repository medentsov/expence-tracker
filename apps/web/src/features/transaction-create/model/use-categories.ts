'use client';

import type { Category } from '@tracker/shared';
import { useEffect, useState } from 'react';
import { listCategories } from '@/entities/category';
import { getToken } from '@/entities/session';
import { ApiError } from '@/shared/api/client';

interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      setError('Нет токена');
      return;
    }
    setLoading(true);
    setError(null);
    listCategories(token)
      .then(setCategories)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Не удалось загрузить категории');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { categories, loading, error, reload };
}