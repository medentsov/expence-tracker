import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Category } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { GetCategoriesQuery } from '../get-categories.query';

/**
 * Обработчик запроса списка категорий.
 *
 * Возвращает категории текущего пользователя, отсортированные по `name` asc.
 */
@QueryHandler(GetCategoriesQuery)
export class GetCategoriesHandler implements IQueryHandler<GetCategoriesQuery, Category[]> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Выполняет получение списка категорий.
   *
   * @param query Запрос (`GetCategoriesQuery`) с `userId`.
   *
   * @returns Массив `Category[]`, отсортированный по `name` asc.
   */
  execute(query: GetCategoriesQuery): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { userId: query.userId },
      orderBy: { name: 'asc' },
    });
  }
}
