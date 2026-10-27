import { IQuery } from '@nestjs/cqrs';

/**
 * Запрос сводки доходов/расходов за месяц.
 *
 * Передаёт payload из контроллера в `GetTransactionsSummaryHandler`.
 *
 * @param userId ID владельца (из `@CurrentUser()`).
 * @param month  Месяц (1–12).
 * @param year   Год (≥2000).
 */
export class GetTransactionsSummaryQuery implements IQuery {
	constructor(
		public readonly userId: string,
		public readonly month: number,
		public readonly year: number,
	) {}
}
