'use client';

import type { Category } from '@tracker/shared';
import { useCallback, useState } from 'react';
import { createCategory, updateCategory } from '@/entities/category';
import { getToken } from '@/entities/session';
import { ApiError } from '@/shared/api/client';
import type { CategoryFormValues } from './schema';

interface UseSaveCategoryResult {
  isSubmitting: boolean;
  rootError: string | null;
  resetError: () => void;
  /** Сохраняет категорию: `category === null` — создание, иначе обновление. */
  save: (category: Category | null, values: CategoryFormValues) => Promise<boolean>;
}

export function useSaveCategory(onSaved?: () => void): UseSaveCategoryResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);

  const resetError = useCallback(() => setRootError(null), []);

  const save = useCallback(
    async (category: Category | null, values: CategoryFormValues): Promise<boolean> => {
      const token = getToken();
      if (!token) {
        setRootError('Нет токена');
        return false;
      }

      const input = {
        name: values.name.trim(),
        icon: values.icon.trim(),
        color: values.color || undefined,
      };

      setIsSubmitting(true);
      setRootError(null);
      try {
        if (category) {
          await updateCategory(token, category.id, input);
        } else {
          await createCategory(token, input);
        }
        onSaved?.();
        return true;
      } catch (error) {
        setRootError(
          error instanceof ApiError ? error.message : 'Не удалось сохранить категорию',
        );
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSaved],
  );

  return { isSubmitting, rootError, resetError, save };
}
