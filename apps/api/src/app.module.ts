import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { AuthModule } from './modules/auth/auth.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { UsersModule } from './modules/users/users.module';

/**
 * Корневой модуль приложения.
 *
 * Порядок импорта: сначала инфраструктура (`CqrsModule.forRoot()` — глобальные
 * шины `CommandBus`/`QueryBus`/`EventBus`; `PrismaModule` — глобальный доступ к БД),
 * затем владелец данных (`UsersModule`), затем доменные модули и `AuthModule`
 * (регистрирует глобальный `JwtAuthGuard`) последним.
 *
 * Зависимости: `@nestjs/cqrs`, `@nestjs/core`, Prisma, все feature-модули.
 */
@Module({
	imports: [
		// CqrsModule.forRoot() регистрирует шины (CommandBus/QueryBus/EventBus) глобально.
		CqrsModule.forRoot(),
		PrismaModule,
		UsersModule,
		CategoriesModule,
		ExpensesModule,
		TransactionsModule,
		AuthModule,
	],
})
export class AppModule {}
