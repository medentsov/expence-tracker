import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { AuthModule } from './modules/auth/auth.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  // CqrsModule.forRoot() регистрирует шины (CommandBus/QueryBus/EventBus) глобально.
  imports: [
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