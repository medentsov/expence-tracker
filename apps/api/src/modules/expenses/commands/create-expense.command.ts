import { ICommand } from '@nestjs/cqrs';

/**
 * Команда создания расхода.
 *
 * Передаёт payload из контроллера в `CreateExpenseHandler`.
 * Валидация полей — на уровне DTO (`CreateExpenseDto`).
 *
 * @param userId     ID владельца (из `@CurrentUser()`).
 * @param amount     Сумма расхода (Decimal(12,2)).
 * @param categoryId UUID категории.
 * @param currency   Валюта (необязательно, до 3 символов, по умолчанию RUB);
 *                   для legacy-модуля, у `transactions` поля `currency` нет.
 * @param note       Комментарий (необязательно, до 500 символов).
 * @param date       Дата расхода в ISO 8601 (необязательно; в Prisma поле с `@default(now())`).
 */
export class CreateExpenseCommand implements ICommand {
	constructor(
		public readonly userId: string,
		public readonly amount: number,
		public readonly categoryId: string,
		public readonly currency?: string,
		public readonly note?: string,
		public readonly date?: string,
	) {}
}
