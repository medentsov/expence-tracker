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
import { CreateCategoryCommand } from './commands/create-category.command';
import { DeleteCategoryCommand } from './commands/delete-category.command';
import { UpdateCategoryCommand } from './commands/update-category.command';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetCategoriesQuery } from './queries/get-categories.query';
import { GetCategoryQuery } from './queries/get-category.query';

/**
 * REST-контроллер категорий.
 *
 * CRUD категорий текущего пользователя. Все роуты защищены глобальным
 * `JwtAuthGuard` (`@ApiBearerAuth`), идентификация — из `@CurrentUser()`.
 *
 * Контроллер не содержит бизнес-логики: транслирует DTO в команды/запросы CQRS.
 * Данные изолируются по `userId` внутри хендлеров/ownership-проверок.
 *
 * Зависимости: `@nestjs/cqrs` (шины), auth-декораторы/интерфейсы, DTO модуля.
 */
@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Создаёт новую категорию.
   *
   * @param user Текущий пользователь из JWT.
   * @param dto  Данные категории (`CreateCategoryDto`: name, icon?, color?).
   *
   * @returns Созданную категорию `Category`.
   *
   * @throws `BadRequestException` — невалидное тело (валидация DTO).
   * @throws `UnauthorizedException` — отсутствует/невалиден токен.
   */
  @Post()
  @ApiOperation({ summary: 'Создать категорию' })
  @ApiCreatedResponse({ type: CategoryResponseDto, description: 'Категория создана' })
  @ApiBadRequestResponse({ description: 'Невалидное тело: name/icon/color' })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCategoryDto) {
    return this.commandBus.execute(
      new CreateCategoryCommand(user.id, dto.name, dto.icon, dto.color),
    );
  }

  /**
   * Возвращает список категорий текущего пользователя.
   *
   * @param user Текущий пользователь из JWT.
   *
   * @returns Массив `Category[]`, отсортированный по `name` asc.
   *
   * @throws `UnauthorizedException` — отсутствует/невалиден токен.
   */
  @Get()
  @ApiOperation({ summary: 'Список категорий' })
  @ApiOkResponse({ type: [CategoryResponseDto], description: 'Список категорий по имени asc' })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.queryBus.execute(new GetCategoriesQuery(user.id));
  }

  /**
   * Возвращает одну категорию текущего пользователя.
   *
   * @param user Текущий пользователь из JWT.
   * @param id   UUID категории (`ParseUUIDPipe`).
   *
   * @returns Категорию `Category`.
   *
   * @throws `NotFoundException` — категория не найдена или принадлежит другому
   *         пользователю (404, чтобы не раскрывать наличие чужих записей).
   * @throws `BadRequestException` — `id` не является валидным UUID.
   * @throws `UnauthorizedException` — отсутствует/невалиден токен.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Получить категорию по id' })
  @ApiOkResponse({ type: CategoryResponseDto, description: 'Категория' })
  @ApiBadRequestResponse({ description: 'id не является валидным UUID' })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiNotFoundResponse({ description: 'Категория не найдена или принадлежит другому пользователю' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new GetCategoryQuery(user.id, id));
  }

  /**
   * Частично обновляет категорию текущего пользователя.
   *
   * @param user Текущий пользователь из JWT.
   * @param id   UUID категории (`ParseUUIDPipe`).
   * @param dto  Поля для обновления (`UpdateCategoryDto`, все опциональны).
   *
   * @returns Обновлённую категорию `Category`.
   *
   * @throws `NotFoundException` — категория не найдена или принадлежит другому
   *         пользователю (404).
   * @throws `BadRequestException` — невалидное тело или `id` не UUID.
   * @throws `UnauthorizedException` — отсутствует/невалиден токен.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Обновить категорию' })
  @ApiOkResponse({ type: CategoryResponseDto, description: 'Категория обновлена' })
  @ApiBadRequestResponse({ description: 'Невалидное тело или id не UUID' })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiNotFoundResponse({ description: 'Категория не найдена или принадлежит другому пользователю' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.commandBus.execute(
      new UpdateCategoryCommand(user.id, id, dto.name, dto.icon, dto.color),
    );
  }

  /**
   * Удаляет категорию текущего пользователя.
   *
   * @param user Текущий пользователь из JWT.
   * @param id   UUID категории (`ParseUUIDPipe`).
   *
   * @returns Удалённую категорию `Category`.
   *
   * @throws `NotFoundException` — категория не найдена или принадлежит другому
   *         пользователю (404).
   * @throws `BadRequestException` — `id` не является валидным UUID.
   * @throws `UnauthorizedException` — отсутствует/невалиден токен.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Удалить категорию' })
  @ApiOkResponse({ type: CategoryResponseDto, description: 'Категория удалена' })
  @ApiBadRequestResponse({ description: 'id не является валидным UUID' })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiNotFoundResponse({ description: 'Категория не найдена или принадлежит другому пользователю' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.commandBus.execute(new DeleteCategoryCommand(user.id, id));
  }
}
