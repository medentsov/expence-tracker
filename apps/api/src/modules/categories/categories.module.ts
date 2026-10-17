import { Module } from '@nestjs/common';
import { CreateCategoryHandler } from './commands/handlers/create-category.handler';
import { DeleteCategoryHandler } from './commands/handlers/delete-category.handler';
import { UpdateCategoryHandler } from './commands/handlers/update-category.handler';
import { GetCategoriesHandler } from './queries/handlers/get-categories.handler';
import { GetCategoryHandler } from './queries/handlers/get-category.handler';
import { CategoriesController } from './categories.controller';

// Модуль категорий: контроллер транслирует запросы в команды/запросы CQRS,
// логика живёт в хендлерах.
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