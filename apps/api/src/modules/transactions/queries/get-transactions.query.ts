import { IQuery } from '@nestjs/cqrs';
import type { TransactionType } from '@prisma/client';

export class GetTransactionsQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly dateFrom?: string,
    public readonly dateTo?: string,
    public readonly type?: TransactionType,
    public readonly categoryId?: string,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
