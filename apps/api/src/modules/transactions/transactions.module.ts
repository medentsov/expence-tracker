import { Module } from '@nestjs/common';
import { CreateTransactionHandler } from './commands/handlers/create-transaction.handler';
import { DeleteTransactionHandler } from './commands/handlers/delete-transaction.handler';
import { UpdateTransactionHandler } from './commands/handlers/update-transaction.handler';
import { GetTransactionHandler } from './queries/handlers/get-transaction.handler';
import { GetTransactionsHandler } from './queries/handlers/get-transactions.handler';
import { GetTransactionsSummaryHandler } from './queries/handlers/get-transactions-summary.handler';
import { TransactionsController } from './transactions.controller';

@Module({
  controllers: [TransactionsController],
  providers: [
    CreateTransactionHandler,
    UpdateTransactionHandler,
    DeleteTransactionHandler,
    GetTransactionsHandler,
    GetTransactionHandler,
    GetTransactionsSummaryHandler,
  ],
})
export class TransactionsModule {}