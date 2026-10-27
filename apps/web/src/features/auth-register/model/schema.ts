import { z } from 'zod';

// Схема формы регистрации (правила зеркалят DTO бэкенда:
// password 8..72 — лимит bcrypt, name ≤ 100).
export const registerSchema = z.object({
	email: z.email('Введите корректный email'),
	password: z
		.string()
		.min(8, 'Пароль должен содержать минимум 8 символов')
		.max(72, 'Пароль должен содержать не более 72 символов'),
	name: z.string().max(100, 'Имя должно содержать не более 100 символов').optional(),
	// Чекбокс согласия — не уходит на бэкенд, но обязателен на клиенте.
	agree: z.boolean().refine((value) => value === true, {
		message: 'Необходимо согласие с условиями',
	}),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
