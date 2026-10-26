'use client';

import { useCallback, useState } from 'react';
import { deleteCategory } from '@/entities/category';
import { getToken } from '@/entities/session';
import { ApiError } from '@/shared/api/client';

interface UseDeleteCategoryResult {
  isDeleting: boolean;
  error: string | null;
  resetError: () => void;
  /** Возвращает true, если удаление прошло успешно. */
  remove: (id: string) => Promise<boolean>;
}

export function useDeleteCategory(onDeleted?: () => void): UseDeleteCategoryResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetError = useCallback(() => setError(null), []);

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      const token = getToken();
      if (!token) {
        setError('Нет токена');
        return false;
      }
      setIsDeleting(true);
      setError(null);
      try {
        await deleteCategory(token, id);
        onDeleted?.();
        return true;
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Не удалось удалить категорию');
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [onDeleted],
  );

  return { isDeleting, error, resetError, remove };
}
