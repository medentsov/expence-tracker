import { IQuery } from '@nestjs/cqrs';

/**
 * Запрос одной категории пользователя.
 *
 * Передаёт payload из контроллера в `GetCategoryHandler`. Также используется
 * другими модулями (например, `transactions`) для проверки владения категорией
 * через шину.
 *
 * @param userId ID владельца (из `@CurrentUser()`).
 * @param id     UUID категории.
 */
export class GetCategoryQuery implements IQuery {
	constructor(
		public readonly userId: string,
		public readonly id: string,
	) {}
}
