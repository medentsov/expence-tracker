import { z } from 'zod';
import type { Category } from '@tracker/shared';

// Схема формы категории (правила зеркалят CreateCategoryDto/UpdateCategoryDto).
// Пустые строки для необязательных полей трактуются как «не задано».
export const categorySchema = z.object({
	name: z.string().trim().min(1, 'Укажите название').max(100, 'Не более 100 символов'),
	icon: z.string().max(16, 'Не более 16 символов'),
	color: z.union([z.literal(''), z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Формат: #RRGGBB')]),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const DEFAULT_CATEGORY_COLOR = '#818cf8';

export const CATEGORY_COLORS = [
	'#818cf8',
	'#a78bfa',
	'#f472b6',
	'#fb7185',
	'#f97316',
	'#facc15',
	'#34d399',
	'#22d3ee',
	'#60a5fa',
	'#94a3b8',
] as const;

export const CATEGORY_EMOJI = ['🛒', '🍔', '🚗', '🏠', '💊', '🎁', '✈️', '☕', '💼', '📚', '🎮', '📱'] as const;

export function createEmptyCategoryValues(): CategoryFormValues {
	return {
		name: '',
		icon: '',
		color: DEFAULT_CATEGORY_COLOR,
	};
}

export function toCategoryFormValues(category: Category): CategoryFormValues {
	return {
		name: category.name,
		icon: category.icon ?? '',
		color: category.color ?? DEFAULT_CATEGORY_COLOR,
	};
}
