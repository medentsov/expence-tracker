import { NotFoundException } from '@nestjs/common';
import type { Category } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Возвращает категорию, только если она принадлежит пользователю.
 *
 * Чужую категорию не отличаем от несуществующей (404), чтобы не раскрывать её наличие.
 *
 * @param prisma Сервис Prisma (глобальный, @Global).
 * @param userId ID владельца (из `@CurrentUser()`).
 * @param id     UUID категории.
 *
 * @returns Категорию `Category`.
 *
 * @throws `NotFoundException` — категория не найдена **или** принадлежит другому
 *         пользователю (одинаковый 404).
 */
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
