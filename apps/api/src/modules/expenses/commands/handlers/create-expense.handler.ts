import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { Expense } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateExpenseCommand } from '../create-expense.command';

@CommandHandler(CreateExpenseCommand)
export class CreateExpenseHandler implements ICommandHandler<CreateExpenseCommand, Expense> {
  constructor(private readonly prisma: PrismaService) {}

  execute(command: CreateExpenseCommand): Promise<Expense> {
    return this.prisma.expense.create({
      data: {
        amount: command.amount,
        currency: command.currency,
        note: command.note,
        date: command.date,
        categoryId: command.categoryId,
        userId: command.userId,
      },
    });
  }
}