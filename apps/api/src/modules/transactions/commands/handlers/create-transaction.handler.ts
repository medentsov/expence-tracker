import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import type { Transaction } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { GetCategoryQuery } from '../../../categories/queries/get-category.query';
import { CreateTransactionCommand } from '../create-transaction.command';

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler implements ICommandHandler<CreateTransactionCommand, Transaction> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBus: QueryBus,
  ) {}

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
