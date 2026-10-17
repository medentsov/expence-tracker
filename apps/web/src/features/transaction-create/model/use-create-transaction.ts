'use client';

import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { getToken } from '@/entities/session';
import { createTransaction } from '@/entities/transaction';
import { ApiError } from '@/shared/api/client';
import type { CreateTransactionFormValues } from './schema';

interface UseCreateTransactionResult {
  isSubmitting: boolean;
  rootError: string | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (values: CreateTransactionFormValues) => Promise<void>;
}

export function useCreateTransaction(
  form: UseFormReturn<CreateTransactionFormValues>,
  onCreated?: () => void,
): UseCreateTransactionResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function onSubmit(values: CreateTransactionFormValues): Promise<void> {
    const token = getToken();
    if (!token) {
      setRootError('Нет токена');
      return;
    }
    setIsSubmitting(true);
    setRootError(null);
    try {
      await createTransaction(token, {
        amount: Number(values.amount),
        type: values.type,
        description: values.description || undefined,
        date: values.date,
        categoryId: values.categoryId,
      });
      form.reset();
      setOpen(false);
      onCreated?.();
    } catch (error) {
      setRootError(error instanceof ApiError ? error.message : 'Не удалось создать транзакцию');
    } finally {
      setIsSubmitting(false);
    }
  }

  return { isSubmitting, rootError, open, setOpen, onSubmit };
}