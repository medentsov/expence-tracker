import { Module } from '@nestjs/common';
import { CreateTransactionHandler } from './commands/handlers/create-transaction.handler';
import { DeleteTransactionHandler } from './commands/handlers/delete-transaction.handler';
import { UpdateTransactionHandler } from './commands/handlers/update-transaction.handler';
import { GetTransactionHandler } from './queries/handlers/get-transaction.handler';
import { GetTransactionsHandler } from './queries/handlers/get-transactions.handler';
import { GetTransactionsSummaryHandler } from './queries/handlers/get-transactions-summary.handler';
import { TransactionsController } from './transactions.controller';

/**
 * Модуль транзакций (доходы/расходы).
 *
 * Владелец данных о транзакциях. Экспонирует только контроллер и регистрирует
 * CQRS-хендлеры; наружу не экспортирует ни одного провайдера — взаимодействие
 * с другими модулями идёт только через `CommandBus`/`QueryBus` (по правилу CQRS).
 *
 * Хендлеры находятся глобально через `ExplorerService`, поэтому здесь не требуется
 * обмениваться импортами с `categories`/`auth`. Схема и данные — в `prisma/schema.prisma`.
 *
 * Провайдеры:
 * - команды: `CreateTransactionHandler`, `UpdateTransactionHandler`, `DeleteTransactionHandler`;
 * - запросы: `GetTransactionsHandler`, `GetTransactionHandler`, `GetTransactionsSummaryHandler`.
 */
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