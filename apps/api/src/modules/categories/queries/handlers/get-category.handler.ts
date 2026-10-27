import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Category } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { findOwnedCategory } from '../../category-ownership';
import { GetCategoryQuery } from '../get-category.query';

/**
 * Обработчик запроса одной категории.
 *
 * Делегирует проверку владения и чтение в `findOwnedCategory`.
 *
 * @throws `NotFoundException` — категория не найдена или принадлежит другому
 *         пользователю.
 */
@QueryHandler(GetCategoryQuery)
export class GetCategoryHandler implements IQueryHandler<GetCategoryQuery, Category> {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Выполняет получение категории.
	 *
	 * @param query Запрос (`GetCategoryQuery`) с `userId`/`id`.
	 *
	 * @returns Категорию `Category`.
	 *
	 * @throws `NotFoundException` — категория не найдена или принадлежит другому
	 *         пользователю (одинаковый 404).
	 */
	execute(query: GetCategoryQuery): Promise<Category> {
		return findOwnedCategory(this.prisma, query.userId, query.id);
	}
}
