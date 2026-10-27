import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { Transaction } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { findOwnedTransaction } from '../../transaction-ownership';
import { DeleteTransactionCommand } from '../delete-transaction.command';

/**
 * Обработчик команды удаления транзакции.
 *
 * Проверяет владение транзакцией через `findOwnedTransaction` (404 на чужое),
 * затем удаляет запись в Prisma.
 *
 * @throws `NotFoundException` — транзакция не найденa или принадлежит другому
 *         пользователю.
 */
@CommandHandler(DeleteTransactionCommand)
export class DeleteTransactionHandler implements ICommandHandler<DeleteTransactionCommand, Transaction> {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Выполняет удаление транзакции.
	 *
	 * @param command Команда с `userId` и `id` транзакции (`DeleteTransactionCommand`).
	 *
	 * @returns Удалённую сущность `Transaction` (без вложенной категории).
	 *
	 * @throws `NotFoundException` — транзакция не найдена или принадлежит другому
	 *         пользователю (одинаковый 404).
	 */
	async execute(command: DeleteTransactionCommand): Promise<Transaction> {
		await findOwnedTransaction(this.prisma, command.userId, command.id);

		return this.prisma.transaction.delete({ where: { id: command.id } });
	}
}
