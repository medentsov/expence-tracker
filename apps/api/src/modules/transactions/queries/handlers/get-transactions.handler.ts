import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Prisma } from '@prisma/client';
import type { Paginated, Transaction } from '@tracker/shared';
import { PrismaService } from '../../../../prisma/prisma.service';
import type { TransactionWithCategory } from '../../transaction-ownership';
import { GetTransactionsQuery } from '../get-transactions.query';

@QueryHandler(GetTransactionsQuery)
export class GetTransactionsHandler
  implements IQueryHandler<GetTransactionsQuery, Paginated<Transaction>>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTransactionsQuery): Promise<Paginated<Transaction>> {
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

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      // Prisma отдаёт Decimal и Date — приводим к JSON-представлению из shared-типов.
      items: rows.map((row: TransactionWithCategory) => ({
        id: row.id,
        amount: Number(row.amount),
        type: row.type,
        description: row.description,
        date: row.date.toISOString(),
        categoryId: row.categoryId,
        category: {
          id: row.category.id,
          name: row.category.name,
          icon: row.category.icon,
          color: row.category.color,
          createdAt: row.category.createdAt.toISOString(),
          updatedAt: row.category.updatedAt.toISOString(),
        },
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }
}
