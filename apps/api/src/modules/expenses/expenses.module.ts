import { Module } from '@nestjs/common';
import { CreateExpenseHandler } from './commands/handlers/create-expense.handler';
import { DeleteExpenseHandler } from './commands/handlers/delete-expense.handler';
import { UpdateExpenseHandler } from './commands/handlers/update-expense.handler';
import { ExpensesController } from './expenses.controller';
import { GetExpenseHandler } from './queries/handlers/get-expense.handler';
import { GetExpensesHandler } from './queries/handlers/get-expenses.handler';

/**
 * Модуль расходов (legacy).
 *
 * ⚠️ Создан раньше `transactions`; поддерживается для обратной совместимости.
 * Новый код вести через `transactions`. Экспонирует только контроллер и
 * регистрирует CQRS-хендлеры; наружу не экспортирует провайдеров.
 *
 * Хендлеры работают с `PrismaService` напрямую (глобальный модуль), фильтрация
 * по `userId` — внутри хендлеров/ownership-проверок.
 */
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
