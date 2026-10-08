import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [PrismaModule, CategoriesModule, ExpensesModule, AuthModule],
})
export class AppModule {}