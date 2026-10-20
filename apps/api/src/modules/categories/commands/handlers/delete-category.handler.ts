import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { Category } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { findOwnedCategory } from '../../category-ownership';
import { DeleteCategoryCommand } from '../delete-category.command';

/**
 * Обработчик команды удаления категории.
 *
 * Проверяет владение категорией через `findOwnedCategory` (404 на чужое),
 * затем удаляет запись в Prisma.
 *
 * @throws `NotFoundException` — категория не найдена или принадлежит другому
 *         пользователю.
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
   */
  async execute(command: DeleteCategoryCommand): Promise<Category> {
    await findOwnedCategory(this.prisma, command.userId, command.id);

    return this.prisma.category.delete({ where: { id: command.id } });
  }
}
