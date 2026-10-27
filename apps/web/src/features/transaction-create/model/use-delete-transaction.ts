'use client';

import { useCallback, useState } from 'react';
import { getToken } from '@/entities/session';
import { deleteTransaction } from '@/entities/transaction';
import { ApiError } from '@/shared/api/client';

interface UseDeleteTransactionResult {
	isDeleting: boolean;
	error: string | null;
	resetError: () => void;
	/** Возвращает true, если удаление прошло успешно. */
	remove: (id: string) => Promise<boolean>;
}

export function useDeleteTransaction(onDeleted?: () => void): UseDeleteTransactionResult {
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
				await deleteTransaction(token, id);
				onDeleted?.();
				return true;
			} catch (err) {
				setError(err instanceof ApiError ? err.message : 'Не удалось удалить транзакцию');
				return false;
			} finally {
				setIsDeleting(false);
			}
		},
		[onDeleted],
	);

	return { isDeleting, error, resetError, remove };
}
