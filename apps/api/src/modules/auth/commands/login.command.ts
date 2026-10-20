import { ICommand } from '@nestjs/cqrs';

/**
 * Команда входа по email и паролю.
 *
 * Передаёт payload из контроллера в `LoginHandler`. Валидация полей — на уровне
 * DTO (`LoginDto`) до попадания в команду.
 *
 * @param email    Email пользователя.
 * @param password Пароль (по вхождению не валидируется по длине — важен факт совпадения).
 */
export class LoginCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}
