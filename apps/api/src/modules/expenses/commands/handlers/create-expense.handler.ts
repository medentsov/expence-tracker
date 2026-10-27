import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { Expense } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateExpenseCommand } from '../create-expense.command';

/**
 * Обработчик команды создания расхода.
 *
 * Создаёт расход, привязанный к текущему пользователю, через `PrismaService`.
 * Дата передаётся как есть (Prisma принимает строку для поля `DateTime` с
 * native-типом; конвертация в `Date` не требуется).
 */
@CommandHandler(CreateExpenseCommand)
export class CreateExpenseHandler implements ICommandHandler<CreateExpenseCommand, Expense> {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Выполняет создание расхода.
	 *
	 * @param command Команда (`CreateExpenseCommand`) с `userId`, `amount`,
	 *                `categoryId`, `currency?`, `note?`, `date?`.
	 *
	 * @returns Созданный расход `Expense` (без вложенной категории).
	 */
	execute(command: CreateExpenseCommand): Promise<Expense> {
		return this.prisma.expense.create({
			data: {
				amount: command.amount,
				currency: command.currency,
				note: command.note,
				date: command.date,
				categoryId: command.categoryId,
				userId: command.userId,
			},
		});
	}
}
