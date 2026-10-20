import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { Category } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateCategoryCommand } from '../create-category.command';

/**
 * Обработчик команды создания категории.
 *
 * Создаёт категорию, привязанную к текущему пользователю, через `PrismaService`.
 */
@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand, Category> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Выполняет создание категории.
   *
   * @param command Команда (`CreateCategoryCommand`) с `userId`, `name`, `icon?`, `color?`.
   *
   * @returns Созданную категорию `Category`.
   */
  execute(command: CreateCategoryCommand): Promise<Category> {
    return this.prisma.category.create({
      data: {
        name: command.name,
        icon: command.icon,
        color: command.color,
        userId: command.userId,
      },
    });
  }
}
