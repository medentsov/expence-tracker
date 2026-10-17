import { NotFoundException } from '@nestjs/common';
import type { Category } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

// Возвращает категорию, только если она принадлежит пользователю.
// Чужую категорию не отличаем от несуществующей (404), чтобы не раскрывать её наличие.
export async function findOwnedCategory(
  prisma: PrismaService,
  userId: string,
  id: string,
): Promise<Category> {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category || category.userId !== userId) {
    throw new NotFoundException(`Категория ${id} не найдена`);
  }
  return category;
}