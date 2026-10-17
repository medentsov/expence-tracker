import { IEvent } from '@nestjs/cqrs';

// Событие: пользователь зарегистрирован. Публикуется CreateUserHandler.
export class UserRegisteredEvent implements IEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {}
}