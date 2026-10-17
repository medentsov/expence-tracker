import { NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

// Транзакция вместе со связанной категорией (форма ответа API).
export type TransactionWithCategory = Prisma.TransactionGetPayload<{ include: { category: true } }>;

// Возвращает транзакцию с категорией, только если она принадлежит пользователю.
// Чужую транзакцию не отличаем от несуществующей (404), чтобы не раскрывать её наличие.
export async function findOwnedTransaction(
  prisma: PrismaService,
  userId: string,
  id: string,
): Promise<TransactionWithCategory> {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!transaction || transaction.userId !== userId) {
    throw new NotFoundException(`Транзакция ${id} не найдена`);
  }
  return transaction;
}
