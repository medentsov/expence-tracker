import { Module } from '@nestjs/common';
import { CreateUserHandler } from './commands/handlers/create-user.handler';
import { UserRegisteredHandler } from './events/handlers/user-registered.handler';
import { GetUserByEmailHandler } from './queries/handlers/get-user-by-email.handler';
import { UserRepository } from './users.repository';
import { UsersService } from './users.service';

/**
 * Модуль-владелец данных о пользователях.
 *
 * Контроллера нет: наружу ничего не экспортирует — взаимодействие с ним идёт
 * только через шины CQRS (`CommandBus`/`QueryBus`/`EventBus`). Регистрирует
 * репозиторий, сервис и CQRS-хендлеры (команда создания, запрос по email,
 * событие регистрации).
 *
 * Схема и данные — в `prisma/schema.prisma` (модель `User` с `passwordHash`).
 */
@Module({
	providers: [UsersService, UserRepository, CreateUserHandler, GetUserByEmailHandler, UserRegisteredHandler],
})
export class UsersModule {}
