import type { Category } from '@tracker/shared';
import { apiFetch } from '@/shared/api/client';

// DELETE /categories/:id — удаление категории текущего пользователя.
export function deleteCategory(token: string, id: string): Promise<Category> {
	return apiFetch<Category>(`/categories/${id}`, { method: 'DELETE', token });
}
