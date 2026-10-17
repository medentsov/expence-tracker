import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { Category } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { findOwnedCategory } from '../../category-ownership';
import { DeleteCategoryCommand } from '../delete-category.command';

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler implements ICommandHandler<DeleteCategoryCommand, Category> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteCategoryCommand): Promise<Category> {
    await findOwnedCategory(this.prisma, command.userId, command.id);

    return this.prisma.category.delete({ where: { id: command.id } });
  }
}