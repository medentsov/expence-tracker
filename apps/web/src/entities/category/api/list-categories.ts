import type { Category } from '@tracker/shared';
import { apiFetch } from '@/shared/api/client';

// GET /categories — список категорий текущего пользователя.
export function listCategories(token: string): Promise<Category[]> {
  return apiFetch<Category[]>('/categories', { token });
}