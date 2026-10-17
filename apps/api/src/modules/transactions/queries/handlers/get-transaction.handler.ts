import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../prisma/prisma.service';
import { findOwnedTransaction, type TransactionWithCategory } from '../../transaction-ownership';
import { GetTransactionQuery } from '../get-transaction.query';

@QueryHandler(GetTransactionQuery)
export class GetTransactionHandler
  implements IQueryHandler<GetTransactionQuery, TransactionWithCategory>
{
  constructor(private readonly prisma: PrismaService) {}

  execute(query: GetTransactionQuery): Promise<TransactionWithCategory> {
    return findOwnedTransaction(this.prisma, query.userId, query.id);
  }
}
