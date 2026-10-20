import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { MeResponseDto } from './dto/me-response.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginCommand } from './commands/login.command';
import { RegisterCommand } from './commands/register.command';
import type { AuthenticatedUser } from './interfaces/jwt-payload.interface';

/**
 * REST-контроллер аутентификации.
 *
 * Публичные эндпоинты регистрации/входа (помечены `@Public()` — обходят
 * глобальный `JwtAuthGuard`) и защищённый `GET /auth/me` (данные из JWT).
 *
 * Контроллер не содержит бизнес-логики: транслирует DTO в команды CQRS
 * (`CommandBus`) и отдаёт результат хендлеров. Учётные данные пользователя
 * берутся из модуля `users` через шину (без прямых импортов друг друга).
 *
 * Зависимости: `@nestjs/cqrs` (шины), auth-декораторы/интерфейсы, DTO модуля.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  /**
   * Регистрирует нового пользователя.
   *
   * Публичный эндпоинт (`@Public()`). Хэширует пароль (bcrypt), создаёт
   * пользователя через `CreateUserCommand` (шина → модуль `users`) и выдаёт access-токен.
   *
   * @param dto Данные регистрации (`RegisterDto`): email, пароль (8–72), имя (опц.).
   *
   * @returns `AuthResponse`: `{ accessToken, user }`, где `user` — полный
   *          публичный профиль (без `passwordHash`).
   *
   * @throws `ConflictException` — пользователь с таким email уже существует.
   * @throws `BadRequestException` — невалидное тело (валидация DTO).
   */
  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiCreatedResponse({ type: AuthResponseDto, description: 'Пользователь зарегистрирован' })
  @ApiConflictResponse({ description: 'Пользователь с таким email уже существует' })
  @ApiBadRequestResponse({ description: 'Невалидное тело: email/пароль/имя' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  register(@Body() dto: RegisterDto) {
    return this.commandBus.execute(new RegisterCommand(dto.email, dto.password, dto.name));
  }

  /**
   * Вход по email и паролю.
   *
   * Публичный эндпоинт (`@Public()`). Проверяет учётные данные через
   * `GetUserByEmailQuery` (шина → модуль `users`) и bcrypt, выдаёт access-токен.
   *
   * @param dto Данные входа (`LoginDto`): email, пароль.
   *
   * @returns `AuthResponse`: `{ accessToken, user }` (полный публичный профиль).
   *
   * @throws `UnauthorizedException` — неверный email или пароль (одинаковое
   *         сообщение против перебора).
   * @throws `BadRequestException` — невалидное тело (валидация DTO).
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход по email и паролю' })
  @ApiOkResponse({ type: AuthResponseDto, description: 'Вход выполнен' })
  @ApiUnauthorizedResponse({ description: 'Неверный email или пароль' })
  @ApiBadRequestResponse({ description: 'Невалидное тело: email/пароль' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  login(@Body() dto: LoginDto) {
    return this.commandBus.execute(new LoginCommand(dto.email, dto.password));
  }

  /**
   * Профиль текущего пользователя.
   *
   * Защищённый эндпоинт: данные берутся из JWT, положенного в `request.user`
   * глобальным `JwtAuthGuard`. Возвращает **JWT-payload**, а не полный `User`
   * (полный профиль — только в ответах login/register).
   *
   * @param user Аутентифицированный пользователь из `@CurrentUser()`.
   *
   * @returns `AuthenticatedUser`: `{ id, email, name? }` (полезная нагрузка JWT).
   *
   * @throws `UnauthorizedException` — отсутствует/невалиден токен.
   */
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Профиль текущего пользователя' })
  @ApiOkResponse({ type: MeResponseDto, description: 'Данные из JWT (без полного User)' })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
