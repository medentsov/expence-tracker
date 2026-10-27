import { ConflictException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { Category } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { findOwnedCategory } from '../../category-ownership';
import { DeleteCategoryCommand } from '../delete-category.command';

/**
 * Обработчик команды удаления категории.
 *
 * Проверяет владение категорией через `findOwnedCategory` (404 на чужое),
 * затем удаляет запись в Prisma. Категорию с операциями удалить нельзя:
 * связи `Transaction`/`Expense` объявлены с `onDelete: Restrict`, поэтому
 * вместо неинформативной ошибки БД отдаём 409.
 *
 * @throws `NotFoundException` — категория не найдена или принадлежит другому
 *         пользователю.
 * @throws `ConflictException` — в категории есть транзакции или расходы.
 */
@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler implements ICommandHandler<DeleteCategoryCommand, Category> {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Выполняет удаление категории.
	 *
	 * @param command Команда (`DeleteCategoryCommand`) с `userId`/`id`.
	 *
	 * @returns Удалённую категорию `Category`.
	 *
	 * @throws `NotFoundException` — категория не найдена или принадлежит другому
	 *         пользователю (одинаковый 404).
	 * @throws `ConflictException` — категория используется операциями.
	 */
	async execute(command: DeleteCategoryCommand): Promise<Category> {
		await findOwnedCategory(this.prisma, command.userId, command.id);

		const [transactions, expenses] = await this.prisma.$transaction([
			this.prisma.transaction.count({ where: { categoryId: command.id } }),
			this.prisma.expense.count({ where: { categoryId: command.id } }),
		]);

		if (transactions > 0 || expenses > 0) {
			throw new ConflictException(
				'Нельзя удалить категорию, пока в ней есть операции. Сначала перенесите или удалите их.',
			);
		}

		return this.prisma.category.delete({ where: { id: command.id } });
	}
}
