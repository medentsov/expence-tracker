import type { Category, CategoryInput } from '@tracker/shared';
import { apiFetch } from '@/shared/api/client';

// POST /categories — создание категории текущего пользователя.
export function createCategory(token: string, input: CategoryInput): Promise<Category> {
  return apiFetch<Category>('/categories', { method: 'POST', body: input, token });
}
