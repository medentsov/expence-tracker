import { z } from 'zod';

// Схема формы создания транзакции (правила зеркалят CreateTransactionDto).
// Сумма вводится строкой и проверяется на положительное число.
export const createTransactionSchema = z.object({
  amount: z
    .string()
    .min(1, 'Укажите сумму')
    .refine((value) => Number(value) > 0, 'Сумма должна быть больше нуля'),
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().max(500, 'Не более 500 символов').optional(),
  date: z.string().min(1, 'Укажите дату'),
  categoryId: z.string().min(1, 'Выберите категорию'),
});

export type CreateTransactionFormValues = z.infer<typeof createTransactionSchema>;