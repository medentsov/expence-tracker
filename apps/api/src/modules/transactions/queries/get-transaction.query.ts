import { IQuery } from '@nestjs/cqrs';

/**
 * Запрос получения одной транзакции.
 *
 * Передаёт payload из контроллера в `GetTransactionHandler`.
 *
 * @param userId ID владельца (из `@CurrentUser()`) — для проверки владения.
 * @param id     UUID транзакции.
 */
export class GetTransactionQuery implements IQuery {
	constructor(
		public readonly userId: string,
		public readonly id: string,
	) {}
}
