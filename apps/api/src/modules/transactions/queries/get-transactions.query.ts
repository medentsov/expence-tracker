import { IQuery } from '@nestjs/cqrs';
import type { TransactionType } from '@prisma/client';

/**
 * Запрос постраничного списка транзакций с фильтрами.
 *
 * Передаёт payload из контроллера в `GetTransactionsHandler`.
 *
 * @param userId     ID владельца (из `@CurrentUser()`).
 * @param dateFrom   Нижняя граница даты (ISO 8601, включительно).
 * @param dateTo     Верхняя граница даты (ISO 8601, включительно).
 * @param type       Фильтр по типу: `INCOME`/`EXPENSE`.
 * @param categoryId Фильтр по UUID категории.
 * @param page       Номер страницы (с 1, по умолчанию 1).
 * @param limit      Размер страницы (1–100, по умолчанию 10).
 */
export class GetTransactionsQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly dateFrom?: string,
    public readonly dateTo?: string,
    public readonly type?: TransactionType,
    public readonly categoryId?: string,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
