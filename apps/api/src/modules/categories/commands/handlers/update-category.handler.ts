import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { Category } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { findOwnedCategory } from '../../category-ownership';
import { UpdateCategoryCommand } from '../update-category.command';

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand, Category> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateCategoryCommand): Promise<Category> {
    await findOwnedCategory(this.prisma, command.userId, command.id);

    return this.prisma.category.update({
      where: { id: command.id },
      data: { name: command.name, icon: command.icon, color: command.color },
    });
  }
}