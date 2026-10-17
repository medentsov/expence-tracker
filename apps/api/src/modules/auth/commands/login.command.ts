import { ICommand } from '@nestjs/cqrs';

// Команда входа по email и паролю.
export class LoginCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}