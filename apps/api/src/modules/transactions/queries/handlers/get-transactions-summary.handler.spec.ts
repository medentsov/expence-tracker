import type { PrismaService } from '../../../../prisma/prisma.service';
import { GetTransactionsSummaryHandler } from './get-transactions-summary.handler';
import { GetTransactionsSummaryQuery } from '../get-transactions-summary.query';

describe('GetTransactionsSummaryHandler', () => {
  const groupBy = jest.fn();
  const prisma = { transaction: { groupBy } } as unknown as PrismaService;
  const handler = new GetTransactionsSummaryHandler(prisma);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('возвращает сводку доходов и расходов за месяц', async () => {
    groupBy.mockResolvedValue([
      { type: 'INCOME', _sum: { amount: 1000 } },
      { type: 'EXPENSE', _sum: { amount: 250 } },
    ]);

    const result = await handler.execute(
      new GetTransactionsSummaryQuery('u1', 10, 2026),
    );

    expect(result).toEqual({
      month: 10,
      year: 2026,
      totalIncome: 1000,
      totalExpense: 250,
      balance: 750,
    });
  });

  it('считает границы месяца от первого дня до первого дня следующего', async () => {
    groupBy.mockResolvedValue([]);

    await handler.execute(new GetTransactionsSummaryQuery('u1', 10, 2026));

    const from = new Date(Date.UTC(2026, 9, 1));
    const to = new Date(Date.UTC(2026, 10, 1));
    expect(groupBy).toHaveBeenCalledWith({
      by: ['type'],
      where: { userId: 'u1', date: { gte: from, lt: to } },
      _sum: { amount: true },
    });
  });

  it('приводит null-суммы к нулю и не падает на пустом результате', async () => {
    groupBy.mockResolvedValue([
      { type: 'EXPENSE', _sum: { amount: null } },
    ]);

    const result = await handler.execute(
      new GetTransactionsSummaryQuery('u1', 1, 2026),
    );

    expect(result).toEqual({
      month: 1,
      year: 2026,
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
    });
  });
});
