import { ICommand } from '@nestjs/cqrs';
import type { TransactionType } from '@prisma/client';

/**
 * Команда частичного обновления транзакции.
 *
 * Передаёт payload из контроллера в `UpdateTransactionHandler`. Все поля опциональны
 * (PATCH-семантика): обновляются только переданные. `categoryId` при обновлении
 * проверяется на принадлежность пользователю.
 *
 * @param userId      ID владельца (из `@CurrentUser()`).
 * @param id          UUID транзакции.
 * @param amount      Новая сумма (необязательно).
 * @param type        Новый тип: `INCOME`/`EXPENSE` (необязательно).
 * @param date        Новая дата в ISO 8601 (необязательно).
 * @param categoryId  Новый UUID категории (необязательно).
 * @param description Новое описание (необязательно).
 */
export class UpdateTransactionCommand implements ICommand {
	constructor(
		public readonly userId: string,
		public readonly id: string,
		public readonly amount?: number,
		public readonly type?: TransactionType,
		public readonly date?: string,
		public readonly categoryId?: string,
		public readonly description?: string,
	) {}
}
