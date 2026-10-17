import { Module } from '@nestjs/common';
import { CreateExpenseHandler } from './commands/handlers/create-expense.handler';
import { DeleteExpenseHandler } from './commands/handlers/delete-expense.handler';
import { UpdateExpenseHandler } from './commands/handlers/update-expense.handler';
import { ExpensesController } from './expenses.controller';
import { GetExpenseHandler } from './queries/handlers/get-expense.handler';
import { GetExpensesHandler } from './queries/handlers/get-expenses.handler';

// Модуль расходов: контроллер транслирует запросы в команды/запросы CQRS,
// логика живёт в хендлерах.
@Module({
  controllers: [ExpensesController],
  providers: [
    CreateExpenseHandler,
    UpdateExpenseHandler,
    DeleteExpenseHandler,
    GetExpensesHandler,
    GetExpenseHandler,
  ],
})
export class ExpensesModule {}