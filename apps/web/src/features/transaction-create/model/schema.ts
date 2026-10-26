import { z } from 'zod';
import { dateToInputDate, todayInputDate } from '@/shared/lib/date';
import type { EditableTransaction } from './types';

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

// Чистые значения формы: дата — сегодняшняя по локальному времени.
export function createEmptyValues(): CreateTransactionFormValues {
  return {
    amount: '',
    type: 'EXPENSE',
    description: '',
    date: todayInputDate(),
    categoryId: '',
  };
}

// Значения формы для существующей транзакции (режим редактирования).
export function toFormValues(transaction: EditableTransaction): CreateTransactionFormValues {
  return {
    amount: String(transaction.amount),
    type: transaction.type,
    description: transaction.description ?? '',
    date: dateToInputDate(transaction.date),
    categoryId: transaction.categoryId,
  };
}
