import { ICommand } from '@nestjs/cqrs';

/**
 * Команда удаления категории.
 *
 * Передаёт payload из контроллера в `DeleteCategoryHandler`.
 *
 * @param userId ID владельца (из `@CurrentUser()`) — для проверки владения.
 * @param id     UUID категории.
 */
export class DeleteCategoryCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
