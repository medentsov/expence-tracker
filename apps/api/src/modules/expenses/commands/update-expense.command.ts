import { ICommand } from '@nestjs/cqrs';

/**
 * Команда частичного обновления расхода.
 *
 * Передаёт payload из контроллера в `UpdateExpenseHandler`. Все поля опциональны
 * (PATCH-семантика): обновляются только переданные.
 *
 * @param userId     ID владельца (из `@CurrentUser()`).
 * @param id         UUID расхода.
 * @param amount     Новая сумма (необязательно).
 * @param currency   Новая валюта (необязательно).
 * @param note       Новый комментарий (необязательно).
 * @param date       Новая дата в ISO 8601 (необязательно).
 * @param categoryId Новый UUID категории (необязательно).
 */
export class UpdateExpenseCommand implements ICommand {
	constructor(
		public readonly userId: string,
		public readonly id: string,
		public readonly amount?: number,
		public readonly currency?: string,
		public readonly note?: string,
		public readonly date?: string,
		public readonly categoryId?: string,
	) {}
}
