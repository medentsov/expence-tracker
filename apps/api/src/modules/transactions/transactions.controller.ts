import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
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
import { CreateTransactionCommand } from './commands/create-transaction.command';
import { DeleteTransactionCommand } from './commands/delete-transaction.command';
import { UpdateTransactionCommand } from './commands/update-transaction.command';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';
import { GetTransactionsSummaryQueryDto } from './dto/get-transactions-summary-query.dto';
import {
  PaginatedTransactionsResponseDto,
  TransactionResponseDto,
} from './dto/transaction-response.dto';
import { TransactionsSummaryResponseDto } from './dto/transactions-summary-response.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { GetTransactionQuery } from './queries/get-transaction.query';
import { GetTransactionsQuery } from './queries/get-transactions.query';
import { GetTransactionsSummaryQuery } from './queries/get-transactions-summary.query';

/**
 * REST-контроллер транзакций.
 *
 * Публичные эндпоинты учёта доходов/расходов. Все роуты защищены глобальным
 * `JwtAuthGuard` (`@ApiBearerAuth`), идентификация пользователя — из `@CurrentUser()`.
 *
 * Контроллер не содержит бизнес-логики: транслирует DTO в команды/запросы CQRS
 * (`CommandBus`/`QueryBus`) и отдаёт результат хендлеров. Данные изолируются
 * по `userId` внутри хендлеров/ownership-проверок.
 *
 * Зависимости: `@nestjs/cqrs` (шины), auth-декораторы/интерфейсы, DTO модуля.
 *
 * Для Swagger используются классы-ответы: `TransactionResponseDto`,
 * `PaginatedTransactionsResponseDto`, `TransactionsSummaryResponseDto`.
 */
@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Создаёт новую транзакцию.
   *
   * @param user  Текущий пользователь из JWT (`AuthenticatedUser`).
   * @param dto   Данные транзакции (сумма, тип, дата, категория, описание).
   *
   * @returns Созданную сущность `Transaction` (без вложенной категории).
   *
   * @throws `NotFoundException` — категория не принадлежит пользователю.
   * @throws `BadRequestException` — невалидное тело (валидация DTO).
   * @throws `UnauthorizedException` — отсутствует/невалиден токен.
   */
  @Post()
  @ApiOperation({ summary: 'Создать транзакцию' })
  @ApiCreatedResponse({ type: TransactionResponseDto, description: 'Транзакция создана' })
  @ApiBadRequestResponse({ description: 'Невалидное тело: сумма ≤ 0, тип/дата/категория неверны' })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiNotFoundResponse({ description: 'Категория не найдена или принадлежит другому пользователю' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateTransactionDto) {
    return this.commandBus.execute(
      new CreateTransactionCommand(
        user.id,
        dto.amount,
        dto.type,
        dto.date,
        dto.categoryId,
        dto.description,
      ),
    );
  }

  /**
   * Считает сводку доходов/расходов за месяц.
   *
   * ⚠️ Обрабатывается до `GET /transactions/:id` — порядок статических и
   * динамических маршрутов важен.
   *
   * @param user  Текущий пользователь из JWT.
   * @param query Параметры месяца/года (`GetTransactionsSummaryQueryDto`).
   *
   * @returns Сводку `TransactionsSummary`: общие доходы/расходы/баланс за месяц.
   *
   * @throws `BadRequestException` — `month`/`year` вне диапазона (валидация DTO).
   * @throws `UnauthorizedException` — отсутствует/невалиден токен.
   */
  // ⚠️ Порядок важен: сначала статические маршруты, потом динамические.
  @Get('summary')
  @ApiOperation({ summary: 'Сводка за месяц' })
  @ApiOkResponse({ type: TransactionsSummaryResponseDto, description: 'Сводка за указанный месяц' })
  @ApiBadRequestResponse({ description: 'month (1–12) или year (≥2000) вне диапазона' })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  summary(@CurrentUser() user: AuthenticatedUser, @Query() query: GetTransactionsSummaryQueryDto) {
    return this.queryBus.execute(
      new GetTransactionsSummaryQuery(user.id, query.month, query.year),
    );
  }

  /**
   * Возвращает постраничный список транзакций с фильтрами.
   *
   * @param user  Текущий пользователь из JWT.
   * @param query Фильтры и пагинация: `dateFrom`/`dateTo`/`type`/`categoryId`/`page`/`limit`.
   *
   * @returns `Paginated<Transaction>`: `{ items, total, page, limit }`, отсортирован
   *          по `date` desc, категория вложена. `amount` — число, даты — ISO-строки.
   *
   * @throws `BadRequestException` — невалидные параметры (валидация DTO).
   * @throws `UnauthorizedException` — отсутствует/невалиден токен.
   */
  @Get()
  @ApiOperation({ summary: 'Список транзакций (пагинация + фильтры)' })
  @ApiOkResponse({ type: PaginatedTransactionsResponseDto, description: 'Постраничный список транзакций' })
  @ApiBadRequestResponse({ description: 'Невалидные параметры фильтрации/пагинации' })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: GetTransactionsQueryDto) {
    return this.queryBus.execute(
      new GetTransactionsQuery(
        user.id,
        query.dateFrom,
        query.dateTo,
        query.type,
        query.categoryId,
        query.page,
        query.limit,
      ),
    );
  }

  /**
   * Возвращает одну транзакцию текущего пользователя.
   *
   * @param user Текущий пользователь из JWT.
   * @param id   UUID транзакции (`ParseUUIDPipe`).
   *
   * @returns Транзакцию со вложенной категорией (`TransactionWithCategory`).
   *
   * @throws `NotFoundException` — транзакция не найдена или принадлежит другому
   *         пользователю (404, чтобы не раскрывать наличие чужих записей).
   * @throws `BadRequestException` — `id` не является валидным UUID.
   * @throws `UnauthorizedException` — отсутствует/невалиден токен.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Получить транзакцию по id' })
  @ApiOkResponse({ type: TransactionResponseDto, description: 'Транзакция со вложенной категорией' })
  @ApiBadRequestResponse({ description: 'id не является валидным UUID' })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiNotFoundResponse({ description: 'Транзакция не найдена или принадлежит другому пользователю' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new GetTransactionQuery(user.id, id));
  }

  /**
   * Частично обновляет транзакцию текущего пользователя.
   *
   * @param user Текущий пользователь из JWT.
   * @param id   UUID транзакции (`ParseUUIDPipe`).
   * @param dto   Поля для обновления (`UpdateTransactionDto`, все опциональны).
   *
   * @returns Обновлённую сущность `Transaction` (без вложенной категории).
   *
   * @throws `NotFoundException` — транзакция не найдена или принадлежит другому
   *         пользователю (404).
   * @throws `BadRequestException` — невалидное тело или `id` не UUID.
   * @throws `UnauthorizedException` — отсутствует/невалиден токен.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Обновить транзакцию' })
  @ApiOkResponse({ type: TransactionResponseDto, description: 'Транзакция обновлена' })
  @ApiBadRequestResponse({ description: 'Невалидное тело или id не UUID' })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiNotFoundResponse({ description: 'Транзакция или новая категория не найдены/чужие' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.commandBus.execute(
      new UpdateTransactionCommand(
        user.id,
        id,
        dto.amount,
        dto.type,
        dto.date,
        dto.categoryId,
        dto.description,
      ),
    );
  }

  /**
   * Удаляет транзакцию текущего пользователя.
   *
   * @param user Текущий пользователь из JWT.
   * @param id   UUID транзакции (`ParseUUIDPipe`).
   *
   * @returns Удалённую сущность `Transaction` (без вложенной категории).
   *
   * @throws `NotFoundException` — транзакция не найдена или принадлежит другому
   *         пользователю (404).
   * @throws `BadRequestException` — `id` не является валидным UUID.
   * @throws `UnauthorizedException` — отсутствует/невалиден токен.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Удалить транзакцию' })
  @ApiOkResponse({ type: TransactionResponseDto, description: 'Транзакция удалена' })
  @ApiBadRequestResponse({ description: 'id не является валидным UUID' })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiNotFoundResponse({ description: 'Транзакция не найдена или принадлежит другому пользователю' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.commandBus.execute(new DeleteTransactionCommand(user.id, id));
  }
}
