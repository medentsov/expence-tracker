import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { Expense } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { findOwnedExpense } from '../../expense-ownership';
import { UpdateExpenseCommand } from '../update-expense.command';

/**
 * Обработчик команды частичного обновления расхода.
 *
 * Проверяет владение расходом (`findOwnedExpense`), затем обновляет только
 * переданные поля (PATCH-семантика).
 *
 * @throws `NotFoundException` — расход не найден или принадлежит другому
 *         пользователю.
 */
@CommandHandler(UpdateExpenseCommand)
export class UpdateExpenseHandler implements ICommandHandler<UpdateExpenseCommand, Expense> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Выполняет обновление расхода.
   *
   * @param command Команда (`UpdateExpenseCommand`) с `userId`/`id` и опциональными полями.
   *
   * @returns Обновлённый расход `Expense` (без вложенной категории).
   *
   * @throws `NotFoundException` — расход не найден или принадлежит другому
   *         пользователю (одинаковый 404).
   */
  async execute(command: UpdateExpenseCommand): Promise<Expense> {
    await findOwnedExpense(this.prisma, command.userId, command.id);

    return this.prisma.expense.update({
      where: { id: command.id },
      data: {
        amount: command.amount,
        currency: command.currency,
        note: command.note,
        date: command.date,
        categoryId: command.categoryId,
      },
    });
  }
}
