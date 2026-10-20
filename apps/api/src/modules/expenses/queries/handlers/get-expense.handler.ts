import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../prisma/prisma.service';
import { findOwnedExpense, type ExpenseWithCategory } from '../../expense-ownership';
import { GetExpenseQuery } from '../get-expense.query';

/**
 * Обработчик запроса одного расхода.
 *
 * Делегирует проверку владения и чтение в `findOwnedExpense`.
 *
 * @throws `NotFoundException` — расход не найден или принадлежит другому
 *         пользователю.
 */
@QueryHandler(GetExpenseQuery)
export class GetExpenseHandler implements IQueryHandler<GetExpenseQuery, ExpenseWithCategory> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Выполняет получение расхода.
   *
   * @param query Запрос (`GetExpenseQuery`) с `userId`/`id`.
   *
   * @returns Расход со вложенной категорией (`ExpenseWithCategory`).
   *
   * @throws `NotFoundException` — расход не найден или принадлежит другому
   *         пользователю (одинаковый 404).
   */
  execute(query: GetExpenseQuery): Promise<ExpenseWithCategory> {
    return findOwnedExpense(this.prisma, query.userId, query.id);
  }
}
