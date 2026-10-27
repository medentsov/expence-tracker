import { IEvent } from '@nestjs/cqrs';

/**
 * Событие: пользователь зарегистрирован.
 *
 * Публикуется `CreateUserHandler` после успешного создания пользователя.
 * Точка расширения для побочных эффектов (приветственное письмо, аналитика и т.п.).
 *
 * @param userId UUID созданного пользователя.
 * @param email  Email созданного пользователя.
 */
export class UserRegisteredEvent implements IEvent {
	constructor(
		public readonly userId: string,
		public readonly email: string,
	) {}
}
