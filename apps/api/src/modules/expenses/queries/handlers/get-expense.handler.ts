import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../prisma/prisma.service';
import { findOwnedExpense, type ExpenseWithCategory } from '../../expense-ownership';
import { GetExpenseQuery } from '../get-expense.query';

@QueryHandler(GetExpenseQuery)
export class GetExpenseHandler implements IQueryHandler<GetExpenseQuery, ExpenseWithCategory> {
  constructor(private readonly prisma: PrismaService) {}

  execute(query: GetExpenseQuery): Promise<ExpenseWithCategory> {
    return findOwnedExpense(this.prisma, query.userId, query.id);
  }
}