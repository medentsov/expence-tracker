import { IQuery } from '@nestjs/cqrs';

/**
 * Запрос одного расхода пользователя.
 *
 * Передаёт payload из контроллера в `GetExpenseHandler`.
 *
 * @param userId ID владельца (из `@CurrentUser()`).
 * @param id     UUID расхода.
 */
export class GetExpenseQuery implements IQuery {
	constructor(
		public readonly userId: string,
		public readonly id: string,
	) {}
}
