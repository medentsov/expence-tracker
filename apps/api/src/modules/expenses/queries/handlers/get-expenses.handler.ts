import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../prisma/prisma.service';
import type { ExpenseWithCategory } from '../../expense-ownership';
import { GetExpensesQuery } from '../get-expenses.query';

@QueryHandler(GetExpensesQuery)
export class GetExpensesHandler implements IQueryHandler<GetExpensesQuery, ExpenseWithCategory[]> {
  constructor(private readonly prisma: PrismaService) {}

  execute(query: GetExpensesQuery): Promise<ExpenseWithCategory[]> {
    return this.prisma.expense.findMany({
      where: { userId: query.userId },
      orderBy: { date: 'desc' },
      include: { category: true },
    });
  }
}