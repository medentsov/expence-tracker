import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../prisma/prisma.service';
import type { ExpenseWithCategory } from '../../expense-ownership';
import { GetExpensesQuery } from '../get-expenses.query';

/**
 * Обработчик запроса списка расходов.
 *
 * Возвращает расходы текущего пользователя, отсортированные по `date` desc,
 * категория вложена (`include: { category: true }`).
 */
@QueryHandler(GetExpensesQuery)
export class GetExpensesHandler implements IQueryHandler<GetExpensesQuery, ExpenseWithCategory[]> {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Выполняет получение списка расходов.
	 *
	 * @param query Запрос (`GetExpensesQuery`) с `userId`.
	 *
	 * @returns Массив `ExpenseWithCategory[]`, отсортированный по `date` desc,
	 *          категория вложена.
	 */
	execute(query: GetExpensesQuery): Promise<ExpenseWithCategory[]> {
		return this.prisma.expense.findMany({
			where: { userId: query.userId },
			orderBy: { date: 'desc' },
			include: { category: true },
		});
	}
}
