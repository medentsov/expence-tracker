import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Prisma } from '@prisma/client';
import type { Paginated, Transaction } from '@tracker/shared';
import { PrismaService } from '../../../../prisma/prisma.service';
import type { TransactionWithCategory } from '../../transaction-ownership';
import { GetTransactionsQuery } from '../get-transactions.query';

// Полный набор ключей сортировки: выбранное поле + вторичные ключи.
// Вторичные ключи делают порядок детерминированным при равных значениях,
// иначе страницы могут «пересекаться» и дублировать записи.
function buildOrderBy(
  sortBy: GetTransactionsQuery['sortBy'],
  sortOrder: GetTransactionsQuery['sortOrder'],
): Prisma.TransactionOrderByWithRelationInput[] {
  const direction = sortOrder ?? 'desc';

  switch (sortBy) {
    case 'amount':
      return [{ amount: direction }, { date: 'desc' }, { id: 'asc' }];
    case 'category':
      return [{ category: { name: direction } }, { date: 'desc' }, { id: 'asc' }];
    case 'name':
      // Пустое описание — не редкость, поэтому при равных названиях
      // (и для записей без описания) порядок задаёт категория.
      return [
        { description: direction },
        { category: { name: 'asc' } },
        { date: 'desc' },
        { id: 'asc' },
      ];
    case 'date':
    default:
      return [{ date: direction }, { id: 'asc' }];
  }
}


/**
 * Обработчик постраничного списка транзакций с фильтрами.
 *
 * Строит `where` по переданным фильтрам (`type`/`categoryId`/`dateFrom`/`dateTo`),
 * выполняет `findMany` (с пагинацией `skip`/`take`) и `count` в одной транзакции
 * для консистентного `total`. `Decimal`/`Date` приводится к JSON-представлению
 * shared-типов (`amount: number`, даты — ISO-строки).
 */
@QueryHandler(GetTransactionsQuery)
export class GetTransactionsHandler
  implements IQueryHandler<GetTransactionsQuery, Paginated<Transaction>>
{
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Выполняет получение списка транзакций.
   *
   * @param query Запрос (`GetTransactionsQuery`) с фильтрами, сортировкой и пагинацией.
   *
   * @returns `Paginated<Transaction>`: `{ items, total, page, limit }`, отсортирован
   *          по выбранному полю (по умолчанию `date` desc); категория вложена;
   *          `amount` — число, даты — ISO-строки.
   *
   * @throws `BadRequestException` — инвалидные параметры (валидация DTO;
   *         в хендлер не попадают, но типы гарантируют диапазон).
   */
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

    const orderBy = buildOrderBy(query.sortBy, query.sortOrder);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy,
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
