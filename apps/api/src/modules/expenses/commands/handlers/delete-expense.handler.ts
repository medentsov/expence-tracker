import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { Expense } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { findOwnedExpense } from '../../expense-ownership';
import { DeleteExpenseCommand } from '../delete-expense.command';

@CommandHandler(DeleteExpenseCommand)
export class DeleteExpenseHandler implements ICommandHandler<DeleteExpenseCommand, Expense> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteExpenseCommand): Promise<Expense> {
    await findOwnedExpense(this.prisma, command.userId, command.id);

    return this.prisma.expense.delete({ where: { id: command.id } });
  }
}