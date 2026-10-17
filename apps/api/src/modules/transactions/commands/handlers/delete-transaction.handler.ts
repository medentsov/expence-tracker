import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { Transaction } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { findOwnedTransaction } from '../../transaction-ownership';
import { DeleteTransactionCommand } from '../delete-transaction.command';

@CommandHandler(DeleteTransactionCommand)
export class DeleteTransactionHandler implements ICommandHandler<DeleteTransactionCommand, Transaction> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteTransactionCommand): Promise<Transaction> {
    await findOwnedTransaction(this.prisma, command.userId, command.id);

    return this.prisma.transaction.delete({ where: { id: command.id } });
  }
}
