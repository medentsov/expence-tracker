import { ICommand } from '@nestjs/cqrs';

/**
 * Команда удаления транзакции.
 *
 * Передаёт payload из контроллера в `DeleteTransactionHandler`.
 *
 * @param userId ID владельца (из `@CurrentUser()`) — используeтся для
 *               проверки владения транзакцией перед удалением.
 * @param id     UUID транзакции.
 */
export class DeleteTransactionCommand implements ICommand {
	constructor(
		public readonly userId: string,
		public readonly id: string,
	) {}
}
