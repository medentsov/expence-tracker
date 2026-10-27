import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiInternalServerErrorResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { CreateExpenseCommand } from './commands/create-expense.command';
import { DeleteExpenseCommand } from './commands/delete-expense.command';
import { UpdateExpenseCommand } from './commands/update-expense.command';
import { ExpenseResponseDto } from './dto/expense-response.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { GetExpensesQuery } from './queries/get-expenses.query';
import { GetExpenseQuery } from './queries/get-expense.query';

/**
 * REST-контроллер расходов (legacy-модуль).
 *
 * CRUD расходов текущего пользователя. Все роуты защищены глобальным
 * `JwtAuthGuard` (`@ApiBearerAuth`), идентификация — из `@CurrentUser()`.
 *
 * ⚠️ Это legacy-модуль (создан раньше `transactions`). Новый код вести через
 * `transactions`; `expenses` поддерживается для обратной совместимости.
 *
 * Контроллер не содержит бизнес-логики: транслирует DTO в команды/запросы CQRS.
 * Данные изолируются по `userId` внутри хендлеров/ownership-проверок.
 *
 * Зависимости: `@nestjs/cqrs` (шины), auth-декораторы/интерфейсы, DTO модуля.
 */
@ApiTags('expenses')
@ApiBearerAuth()
@Controller('expenses')
export class ExpensesController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
	) {}

	/**
	 * Создаёт новый расход.
	 *
	 * @param user Текущий пользователь из JWT.
	 * @param dto  Данные расхода (`CreateExpenseDto`: amount, categoryId, currency?, note?, date?).
	 *
	 * @returns Созданный расход `Expense` (без вложенной категории).
	 *
	 * @throws `BadRequestException` — невалидное тело (валидация DTO).
	 * @throws `UnauthorizedException` — отсутствует/невалиден токен.
	 */
	@Post()
	@ApiOperation({ summary: 'Создать расход' })
	@ApiCreatedResponse({ type: ExpenseResponseDto, description: 'Расход создан' })
	@ApiBadRequestResponse({ description: 'Невалидное тело: amount/categoryId/currency/note/date' })
	@ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
	@ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
	create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateExpenseDto) {
		return this.commandBus.execute(
			new CreateExpenseCommand(user.id, dto.amount, dto.categoryId, dto.currency, dto.note, dto.date),
		);
	}

	/**
	 * Возвращает список расходов текущего пользователя.
	 *
	 * @param user Текущий пользователь из JWT.
	 *
	 * @returns Массив `ExpenseWithCategory[]`, отсортированный по `date` desc,
	 *          категория вложена.
	 *
	 * @throws `UnauthorizedException` — отсутствует/невалиден токен.
	 */
	@Get()
	@ApiOperation({ summary: 'Список расходов' })
	@ApiOkResponse({ type: [ExpenseResponseDto], description: 'Список расходов по date desc' })
	@ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
	@ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
	findAll(@CurrentUser() user: AuthenticatedUser) {
		return this.queryBus.execute(new GetExpensesQuery(user.id));
	}

	/**
	 * Возвращает один расход текущего пользователя.
	 *
	 * @param user Текущий пользователь из JWT.
	 * @param id   UUID расхода (`ParseUUIDPipe`).
	 *
	 * @returns Расход со вложенной категорией (`ExpenseWithCategory`).
	 *
	 * @throws `NotFoundException` — расход не найден или принадлежит другому
	 *         пользователю (404, чтобы не раскрывать наличие чужих записей).
	 * @throws `BadRequestException` — `id` не является валидным UUID.
	 * @throws `UnauthorizedException` — отсутствует/невалиден токен.
	 */
	@Get(':id')
	@ApiOperation({ summary: 'Получить расход по id' })
	@ApiOkResponse({ type: ExpenseResponseDto, description: 'Расход со вложенной категорией' })
	@ApiBadRequestResponse({ description: 'id не является валидным UUID' })
	@ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
	@ApiNotFoundResponse({ description: 'Расход не найден или принадлежит другому пользователю' })
	@ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
	findOne(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
		return this.queryBus.execute(new GetExpenseQuery(user.id, id));
	}

	/**
	 * Частично обновляет расход текущего пользователя.
	 *
	 * @param user Текущий пользователь из JWT.
	 * @param id   UUID расхода (`ParseUUIDPipe`).
	 * @param dto  Поля для обновления (`UpdateExpenseDto`, все опциональны).
	 *
	 * @returns Обновлённый расход `Expense` (без вложенной категории).
	 *
	 * @throws `NotFoundException` — расход не найден или принадлежит другому
	 *         пользователю (404).
	 * @throws `BadRequestException` — невалидное тело или `id` не UUID.
	 * @throws `UnauthorizedException` — отсутствует/невалиден токен.
	 */
	@Patch(':id')
	@ApiOperation({ summary: 'Обновить расход' })
	@ApiOkResponse({ type: ExpenseResponseDto, description: 'Расход обновлён' })
	@ApiBadRequestResponse({ description: 'Невалидное тело или id не UUID' })
	@ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
	@ApiNotFoundResponse({ description: 'Расход не найден или принадлежит другому пользователю' })
	@ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
	update(
		@CurrentUser() user: AuthenticatedUser,
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateExpenseDto,
	) {
		return this.commandBus.execute(
			new UpdateExpenseCommand(user.id, id, dto.amount, dto.currency, dto.note, dto.date, dto.categoryId),
		);
	}

	/**
	 * Удаляет расход текущего пользователя.
	 *
	 * @param user Текущий пользователь из JWT.
	 * @param id   UUID расхода (`ParseUUIDPipe`).
	 *
	 * @returns Удалённый расход `Expense` (без вложенной категории).
	 *
	 * @throws `NotFoundException` — расход не найден или принадлежит другому
	 *         пользователю (404).
	 * @throws `BadRequestException` — `id` не является валидным UUID.
	 * @throws `UnauthorizedException` — отсутствует/невалиден токен.
	 */
	@Delete(':id')
	@ApiOperation({ summary: 'Удалить расход' })
	@ApiOkResponse({ type: ExpenseResponseDto, description: 'Расход удалён' })
	@ApiBadRequestResponse({ description: 'id не является валидным UUID' })
	@ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
	@ApiNotFoundResponse({ description: 'Расход не найден или принадлежит другому пользователю' })
	@ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
	remove(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
		return this.commandBus.execute(new DeleteExpenseCommand(user.id, id));
	}
}
