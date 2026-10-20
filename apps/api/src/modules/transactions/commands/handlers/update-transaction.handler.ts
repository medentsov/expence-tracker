import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import type { Transaction } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { GetCategoryQuery } from '../../../categories/queries/get-category.query';
import { findOwnedTransaction } from '../../transaction-ownership';
import { UpdateTransactionCommand } from '../update-transaction.command';

/**
 * Обработчик команды частичного обновления транзакции.
 *
 * Проверяет владение транзакцией (`findOwnedTransaction`), при смене категории —
 * её принадлежность пользователю (через шину). Обновляет только переданные поля
 * (PATCH-семантика). Дата конвертируется в `Date`.
 *
 * @throws `NotFoundException` — транзакция не найдена/чужая, либо новая категория
 *         не принадлежит пользователю.
 */
@CommandHandler(UpdateTransactionCommand)
export class UpdateTransactionHandler implements ICommandHandler<UpdateTransactionCommand, Transaction> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Выполняет обновление транзакции.
   *
   * @param command Команда с `userId`/`id` и опциональными полями (`UpdateTransactionCommand`).
   *
   * @returns Обновлённую сущность `Transaction` (без вложенной категории).
   *
   * @throws `NotFoundException` — транзакция не найдена/чужая, либо новая
   *         категория (`categoryId`) не принадлежит пользователю.
   */
  async execute(command: UpdateTransactionCommand): Promise<Transaction> {
    await findOwnedTransaction(this.prisma, command.userId, command.id);

    // Если меняется категория — проверяем её принадлежность пользователю.
    if (command.categoryId) {
      await this.queryBus.execute(new GetCategoryQuery(command.userId, command.categoryId));
    }

    return this.prisma.transaction.update({
      where: { id: command.id },
      data: {
        amount: command.amount,
        type: command.type,
        description: command.description,
        date: command.date ? new Date(command.date) : undefined,
        categoryId: command.categoryId,
      },
    });
  }
}
