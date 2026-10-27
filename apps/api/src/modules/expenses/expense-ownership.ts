import { NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Расход вместе со связанной категорией (форма ответа API).
 */
export type ExpenseWithCategory = Prisma.ExpenseGetPayload<{ include: { category: true } }>;

/**
 * Возвращает расход с категорией, только если он принадлежит пользователю.
 *
 * Чужой расход не отличаем от несуществующего (404), чтобы не раскрывать его наличие.
 *
 * @param prisma Сервис Prisma (глобальный, @Global).
 * @param userId ID владельца (из `@CurrentUser()`).
 * @param id     UUID расхода.
 *
 * @returns Расход со вложенной категорией (`ExpenseWithCategory`).
 *
 * @throws `NotFoundException` — расход не найден **или** принадлежит другому
 *         пользователю (одинаковый 404).
 */
export async function findOwnedExpense(
	prisma: PrismaService,
	userId: string,
	id: string,
): Promise<ExpenseWithCategory> {
	const expense = await prisma.expense.findUnique({
		where: { id },
		include: { category: true },
	});
	if (!expense || expense.userId !== userId) {
		throw new NotFoundException(`Расход ${id} не найден`);
	}
	return expense;
}
