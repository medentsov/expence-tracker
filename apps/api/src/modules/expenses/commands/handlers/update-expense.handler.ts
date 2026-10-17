import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { Expense } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { findOwnedExpense } from '../../expense-ownership';
import { UpdateExpenseCommand } from '../update-expense.command';

@CommandHandler(UpdateExpenseCommand)
export class UpdateExpenseHandler implements ICommandHandler<UpdateExpenseCommand, Expense> {
  constructor(private readonly prisma: PrismaService) {}

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