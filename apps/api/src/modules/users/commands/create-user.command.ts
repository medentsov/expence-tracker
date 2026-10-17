import { ICommand } from '@nestjs/cqrs';

// Команда создания пользователя. Обрабатывается в модуле-владельце данных (users).
export class CreateUserCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly name?: string,
  ) {}
}