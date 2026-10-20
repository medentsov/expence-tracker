import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { Category } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { findOwnedCategory } from '../../category-ownership';
import { UpdateCategoryCommand } from '../update-category.command';

/**
 * Обработчик команды частичного обновления категории.
 *
 * Проверяет владение категорией (`findOwnedCategory`), затем обновляет только
 * переданные поля (PATCH-семантика).
 *
 * @throws `NotFoundException` — категория не найдена или принадлежит другому
 *         пользователю.
 */
@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand, Category> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Выполняет обновление категории.
   *
   * @param command Команда (`UpdateCategoryCommand`) с `userId`/`id` и опциональными полями.
   *
   * @returns Обновлённую категорию `Category`.
   *
   * @throws `NotFoundException` — категория не найдена или принадлежит другому
   *         пользователю (одинаковый 404).
   */
  async execute(command: UpdateCategoryCommand): Promise<Category> {
    await findOwnedCategory(this.prisma, command.userId, command.id);

    return this.prisma.category.update({
      where: { id: command.id },
      data: { name: command.name, icon: command.icon, color: command.color },
    });
  }
}
