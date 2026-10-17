import { z } from 'zod';

// Схема формы входа (правила зеркалят DTO бэкенда).
export const loginSchema = z.object({
  email: z.email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
