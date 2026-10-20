import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import type { Transaction } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { GetCategoryQuery } from '../../../categories/queries/get-category.query';
import { CreateTransactionCommand } from '../create-transaction.command';

/**
 * Обработчик команды создания транзакции.
 *
 * Сначала проверяет, что указанная категория принадлежит текущему пользователю
 * (через шину `QueryBus` → `GetCategoryQuery`), затем создаёт запись в Prisma.
 * Дата конвертируется в `Date` (поле `DateTime` с native-типом требует объект `Date`).
 *
 * @throws `NotFoundException` — категория не принадлежит пользователю.
 */
@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler implements ICommandHandler<CreateTransactionCommand, Transaction> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Выполняет создание транзакции.
   *
   * @param command Команда с данными транзакции (`CreateTransactionCommand`).
   *
   * @returns Созданную сущность `Transaction` (без вложенной категории).
   *
   * @throws `NotFoundException` — категория (`categoryId`) не найдена или
   *         принадлежит другому пользователю.
   */
  async execute(command: CreateTransactionCommand): Promise<Transaction> {
    // Проверяем, что категория принадлежит пользователю (иначе 404) — через шину.
    await this.queryBus.execute(new GetCategoryQuery(command.userId, command.categoryId));

    return this.prisma.transaction.create({
      data: {
        amount: command.amount,
        type: command.type,
        description: command.description,
        date: new Date(command.date),
        userId: command.userId,
        categoryId: command.categoryId,
      },
    });
  }
}
