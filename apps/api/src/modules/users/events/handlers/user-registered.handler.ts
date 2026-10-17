import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserRegisteredEvent } from '../user-registered.event';

// Побочный эффект регистрации. Точка расширения для будущих интеграций
// (приветственное письмо, аналитика и т.п.).
@EventsHandler(UserRegisteredEvent)
export class UserRegisteredHandler implements IEventHandler<UserRegisteredEvent> {
  private readonly logger = new Logger(UserRegisteredHandler.name);

  handle(event: UserRegisteredEvent): void {
    this.logger.log(`Зарегистрирован пользователь ${event.userId} (${event.email})`);
  }
}