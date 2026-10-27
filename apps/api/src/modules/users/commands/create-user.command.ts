import { ICommand } from '@nestjs/cqrs';

/**
 * Команда создания пользователя.
 *
 * Обрабатывается в модуле-владельце данных (`users`). Приходит из `auth`
 * (RegisterHandler) через шину `CommandBus`.
 *
 * @param email        Email пользователя (уникальный).
 * @param passwordHash Хэш пароля (bcrypt) — пароль в открытом виде сюда не попадает.
 * @param name         Имя пользователя (необязательно).
 */
export class CreateUserCommand implements ICommand {
	constructor(
		public readonly email: string,
		public readonly passwordHash: string,
		public readonly name?: string,
	) {}
}
