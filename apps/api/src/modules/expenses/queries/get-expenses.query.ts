import { IQuery } from '@nestjs/cqrs';

/**
 * Запрос списка расходов пользователя.
 *
 * Передаёт payload из контроллера в `GetExpensesHandler`.
 *
 * @param userId ID владельца (из `@CurrentUser()`).
 */
export class GetExpensesQuery implements IQuery {
	constructor(public readonly userId: string) {}
}
