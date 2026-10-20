import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserRegisteredEvent } from '../user-registered.event';

/**
 * Обработчик события регистрации пользователя.
 *
 * Побочный эффект регистрации. Точка расширения для будущих интеграций
 * (приветственное письмо, аналитика и т.п.). Сейчас — логирование.
 */
@EventsHandler(UserRegisteredEvent)
export class UserRegisteredHandler implements IEventHandler<UserRegisteredEvent> {
  private readonly logger = new Logger(UserRegisteredHandler.name);

  /**
   * Обрабатывает событие регистрации.
   *
   * @param event Событие (`UserRegisteredEvent`) с `userId` и `email`.
   */
  handle(event: UserRegisteredEvent): void {
    this.logger.log(`Зарегистрирован пользователь ${event.userId} (${event.email})`);
  }
}
