import { Module } from '@nestjs/common';
import { CreateUserHandler } from './commands/handlers/create-user.handler';
import { UserRegisteredHandler } from './events/handlers/user-registered.handler';
import { GetUserByEmailHandler } from './queries/handlers/get-user-by-email.handler';
import { UserRepository } from './users.repository';
import { UsersService } from './users.service';

// Модуль-владелец данных о пользователях. Взаимодействие с ним идёт через шины
// CQRS (CommandBus/QueryBus/EventBus), поэтому ничего не экспортируется наружу.
@Module({
  providers: [
    UsersService,
    UserRepository,
    CreateUserHandler,
    GetUserByEmailHandler,
    UserRegisteredHandler,
  ],
})
export class UsersModule {}