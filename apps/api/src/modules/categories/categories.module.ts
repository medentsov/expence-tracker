import { Module } from '@nestjs/common';
import { CreateCategoryHandler } from './commands/handlers/create-category.handler';
import { DeleteCategoryHandler } from './commands/handlers/delete-category.handler';
import { UpdateCategoryHandler } from './commands/handlers/update-category.handler';
import { GetCategoriesHandler } from './queries/handlers/get-categories.handler';
import { GetCategoryHandler } from './queries/handlers/get-category.handler';
import { CategoriesController } from './categories.controller';

/**
 * Модуль категорий.
 *
 * Владелец данных о категориях. Экспонирует только контроллер и регистрирует
 * CQRS-хендлеры; наружу не экспортирует провайдеров — взаимодействие с другими
 * модулями идёт только через шины (`CommandBus`/`QueryBus`).
 *
 * Хендлеры работают с `PrismaService` напрямую (глобальный модуль), фильтрация
 * по `userId` — внутри хендлеров/ownership-проверок.
 */
@Module({
  controllers: [CategoriesController],
  providers: [
    CreateCategoryHandler,
    UpdateCategoryHandler,
    DeleteCategoryHandler,
    GetCategoriesHandler,
    GetCategoryHandler,
  ],
})
export class CategoriesModule {}
