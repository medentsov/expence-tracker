import { ICommand } from '@nestjs/cqrs';

// Команда регистрации: создать пользователя и выдать access-токен.
export class RegisterCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly name?: string,
  ) {}
}