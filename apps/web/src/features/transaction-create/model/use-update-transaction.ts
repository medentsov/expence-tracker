'use client';

import { useCallback, useState } from 'react';
import { getToken } from '@/entities/session';
import { updateTransaction } from '@/entities/transaction';
import { ApiError } from '@/shared/api/client';
import type { CreateTransactionFormValues } from './schema';

interface UseUpdateTransactionResult {
	isSubmitting: boolean;
	rootError: string | null;
	resetError: () => void;
	/** Возвращает true, если сохранение прошло успешно. */
	submit: (id: string, values: CreateTransactionFormValues) => Promise<boolean>;
}

export function useUpdateTransaction(onUpdated?: () => void): UseUpdateTransactionResult {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [rootError, setRootError] = useState<string | null>(null);

	const resetError = useCallback(() => setRootError(null), []);

	const submit = useCallback(
		async (id: string, values: CreateTransactionFormValues): Promise<boolean> => {
			const token = getToken();
			if (!token) {
				setRootError('Нет токена');
				return false;
			}
			setIsSubmitting(true);
			setRootError(null);
			try {
				await updateTransaction(token, id, {
					amount: Number(values.amount),
					type: values.type,
					// Пустая строка очищает описание: PATCH игнорирует undefined.
					description: values.description ?? '',
					date: values.date,
					categoryId: values.categoryId,
				});
				onUpdated?.();
				return true;
			} catch (error) {
				setRootError(error instanceof ApiError ? error.message : 'Не удалось сохранить транзакцию');
				return false;
			} finally {
				setIsSubmitting(false);
			}
		},
		[onUpdated],
	);

	return { isSubmitting, rootError, resetError, submit };
}
