import { ICommand } from '@nestjs/cqrs';

/**
 * Команда создания категории.
 *
 * Передаёт payload из контроллера в `CreateCategoryHandler`.
 *
 * @param userId ID владельца (из `@CurrentUser()`).
 * @param name   Название категории (до 100 символов).
 * @param icon   Эмодзи-иконка (необязательно, до 16 символов).
 * @param color  HEX-цвет (необязательно, например `#FF5722`).
 */
export class CreateCategoryCommand implements ICommand {
	constructor(
		public readonly userId: string,
		public readonly name: string,
		public readonly icon?: string,
		public readonly color?: string,
	) {}
}
