'use client';

import type { Category } from '@tracker/shared';
import { useCallback, useEffect, useState } from 'react';
import { listCategories } from '@/entities/category';
import { getToken } from '@/entities/session';
import { ApiError } from '@/shared/api/client';

interface UseCategoriesResult {
	categories: Category[];
	loading: boolean;
	error: string | null;
	loaded: boolean;
	reload: () => void;
}

// Категории грузятся лениво — только когда передан enabled (например, диалог открыт).
export function useCategories(enabled: boolean): UseCategoriesResult {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loaded, setLoaded] = useState(false);

	const reload = useCallback(() => {
		const token = getToken();
		if (!token) {
			setError('Нет токена');
			setLoaded(true);
			return;
		}
		setLoading(true);
		setError(null);
		listCategories(token)
			.then(setCategories)
			.catch((err: unknown) => {
				setError(err instanceof ApiError ? err.message : 'Не удалось загрузить категории');
			})
			.finally(() => {
				setLoading(false);
				setLoaded(true);
			});
	}, []);

	useEffect(() => {
		if (enabled && !loaded && !loading) {
			reload();
		}
	}, [enabled, loaded, loading, reload]);

	return { categories, loading, error, loaded, reload };
}
