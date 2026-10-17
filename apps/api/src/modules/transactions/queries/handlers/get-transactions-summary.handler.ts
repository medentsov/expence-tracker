import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../prisma/prisma.service';
import { GetTransactionsSummaryQuery } from '../get-transactions-summary.query';
import type { TransactionsSummary } from '@tracker/shared';

@QueryHandler(GetTransactionsSummaryQuery)
export class GetTransactionsSummaryHandler
  implements IQueryHandler<GetTransactionsSummaryQuery, TransactionsSummary>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTransactionsSummaryQuery): Promise<TransactionsSummary> {
    // Границы месяца: [первый день, первый день следующего месяца).
    const from = new Date(Date.UTC(query.year, query.month - 1, 1));
    const to = new Date(Date.UTC(query.year, query.month, 1));

    const grouped = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId: query.userId,
        date: { gte: from, lt: to },
      },
      _sum: { amount: true },
    });

    const sums: Record<string, number> = {};
    for (const row of grouped) {
      sums[row.type] = Number(row._sum.amount ?? 0);
    }

    const totalIncome = sums.INCOME ?? 0;
    const totalExpense = sums.EXPENSE ?? 0;

    return {
      month: query.month,
      year: query.year,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }
}
