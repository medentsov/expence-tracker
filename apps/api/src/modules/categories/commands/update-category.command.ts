import { ICommand } from '@nestjs/cqrs';

/**
 * Команда частичного обновления категории.
 *
 * Передаёт payload из контроллера в `UpdateCategoryHandler`. Все поля опциональны
 * (PATCH-семантика): обновляются только переданные.
 *
 * @param userId ID владельца (из `@CurrentUser()`).
 * @param id     UUID категории.
 * @param name   Новое название (необязательно).
 * @param icon   Новая эмодзи-иконка (необязательно).
 * @param color  Новый HEX-цвет (необязательно).
 */
export class UpdateCategoryCommand implements ICommand {
	constructor(
		public readonly userId: string,
		public readonly id: string,
		public readonly name?: string,
		public readonly icon?: string,
		public readonly color?: string,
	) {}
}
