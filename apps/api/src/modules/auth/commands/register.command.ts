import { ICommand } from '@nestjs/cqrs';

/**
 * Команда регистрации: создать пользователя и выдать access-токен.
 *
 * Передаёт payload из контроллера в `RegisterHandler`. Хэширование пароля — в
 * хендлере; создание пользователя — через `CreateUserCommand` (шина → модуль `users`).
 *
 * @param email    Email пользователя.
 * @param password Пароль (8–72, лимит bcrypt — валидируется в `RegisterDto`).
 * @param name     Имя пользователя (необязательно, до 100 символов).
 */
export class RegisterCommand implements ICommand {
	constructor(
		public readonly email: string,
		public readonly password: string,
		public readonly name?: string,
	) {}
}
