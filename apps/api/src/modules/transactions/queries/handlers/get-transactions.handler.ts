import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import type { TransactionWithCategory } from '../../transaction-ownership';
import { GetTransactionsQuery } from '../get-transactions.query';

@QueryHandler(GetTransactionsQuery)
export class GetTransactionsHandler
  implements IQueryHandler<GetTransactionsQuery, TransactionWithCategory[]>
{
  constructor(private readonly prisma: PrismaService) {}

  execute(query: GetTransactionsQuery): Promise<TransactionWithCategory[]> {
    const where: Prisma.TransactionWhereInput = {
      userId: query.userId,
    };

    if (query.type) {
      where.type = query.type;
    }
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    // dateFrom/dateTo — границы даты (включительно).
    if (query.dateFrom || query.dateTo) {
      where.date = {
        ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
      };
    }

    return this.prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' },
    });
  }
}
