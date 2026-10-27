import type { Category, CategoryInput } from '@tracker/shared';
import { apiFetch } from '@/shared/api/client';

// PATCH /categories/:id — частичное обновление категории.
export function updateCategory(token: string, id: string, input: Partial<CategoryInput>): Promise<Category> {
	return apiFetch<Category>(`/categories/${id}`, { method: 'PATCH', body: input, token });
}
