import { ConflictException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Prisma, User as PrismaUser } from '@prisma/client';
import type { User } from '@tracker/shared';
import { UserRegisteredEvent } from '../../events/user-registered.event';
import { UsersService } from '../../users.service';
import { CreateUserCommand } from '../create-user.command';

// Создание пользователя — инварианты уникальности email и маппинг ошибок БД
// живут здесь, в модуле-владельце данных.
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, User> {
  constructor(
    private readonly usersService: UsersService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    if (await this.usersService.findByEmail(command.email)) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    let user: PrismaUser;
    try {
      user = await this.usersService.createUser({
        email: command.email,
        passwordHash: command.passwordHash,
        name: command.name,
      });
    } catch (error) {
      // Гонка при одновременной регистрации: сработал UNIQUE(email) в БД.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Пользователь с таким email уже существует');
      }
      throw error;
    }

    this.eventBus.publish(new UserRegisteredEvent(user.id, user.email));

    return this.usersService.toPublicUser(user);
  }
}