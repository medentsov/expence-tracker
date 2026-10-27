import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../prisma/prisma.service';
import { findOwnedTransaction, type TransactionWithCategory } from '../../transaction-ownership';
import { GetTransactionQuery } from '../get-transaction.query';

/**
 * Обработчик запроса одной транзакции.
 *
 * Делегирует проверку владения и чтение в `findOwnedTransaction`.
 *
 * @throws `NotFoundException` — транзакция не найдена или принадлежит другому
 *         пользователю.
 */
@QueryHandler(GetTransactionQuery)
export class GetTransactionHandler implements IQueryHandler<GetTransactionQuery, TransactionWithCategory> {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Выполняет получение транзакции.
	 *
	 * @param query Запрос (`GetTransactionQuery`) с `userId`/`id`.
	 *
	 * @returns Транзакцию со вложенной категорией (`TransactionWithCategory`).
	 *
	 * @throws `NotFoundException` — транзакция не найдена или принадлежит другому
	 *         пользователю (одинаковый 404).
	 */
	execute(query: GetTransactionQuery): Promise<TransactionWithCategory> {
		return findOwnedTransaction(this.prisma, query.userId, query.id);
	}
}
