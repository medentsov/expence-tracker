import { ICommand } from '@nestjs/cqrs';

/**
 * Команда удаления расхода.
 *
 * Передаёт payload из контроллера в `DeleteExpenseHandler`.
 *
 * @param userId ID владельца (из `@CurrentUser()`) — для проверки владения.
 * @param id     UUID расхода.
 */
export class DeleteExpenseCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
