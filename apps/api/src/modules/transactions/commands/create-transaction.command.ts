import { ICommand } from '@nestjs/cqrs';
import type { TransactionType } from '@prisma/client';

/**
 * Команда создания транзакции.
 *
 * Передаёт payload из контроллера в `CreateTransactionHandler`. Валидация полей
 * выполняется на уровне DTO (class-validator) до попадания в команду.
 *
 * @param userId      ID владельца (из `@CurrentUser()`) — используется для
 *                    фильтрации и проверки владения категорией.
 * @param amount      Сумма транзакции (Decimal(12,2), > 0).
 * @param type        Тип транзакции: `INCOME` (доход) или `EXPENSE` (расход).
 * @param date        Дата транзакции в ISO 8601 (например `2026-10-12`).
 * @param categoryId  UUID категории, которой принадлежит транзакция.
 * @param description Описание (необязательно, до 500 символов).
 */
export class CreateTransactionCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly type: TransactionType,
    public readonly date: string,
    public readonly categoryId: string,
    public readonly description?: string,
  ) {}
}
