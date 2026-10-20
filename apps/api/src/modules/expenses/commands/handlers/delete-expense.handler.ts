import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { Expense } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { findOwnedExpense } from '../../expense-ownership';
import { DeleteExpenseCommand } from '../delete-expense.command';

/**
 * Обработчик команды удаления расхода.
 *
 * Проверяет владение расходом через `findOwnedExpense` (404 на чужое),
 * затем удаляет запись в Prisma.
 *
 * @throws `NotFoundException` — расход не найден или принадлежит другому
 *         пользователю.
 */
@CommandHandler(DeleteExpenseCommand)
export class DeleteExpenseHandler implements ICommandHandler<DeleteExpenseCommand, Expense> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Выполняет удаление расхода.
   *
   * @param command Команда (`DeleteExpenseCommand`) с `userId`/`id`.
   *
   * @returns Удалённый расход `Expense` (без вложенной категории).
   *
   * @throws `NotFoundException` — расход не найден или принадлежит другому
   *         пользователю (одинаковый 404).
   */
  async execute(command: DeleteExpenseCommand): Promise<Expense> {
    await findOwnedExpense(this.prisma, command.userId, command.id);

    return this.prisma.expense.delete({ where: { id: command.id } });
  }
}
