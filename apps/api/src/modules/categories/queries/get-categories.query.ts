import { IQuery } from '@nestjs/cqrs';

/**
 * Запрос списка категорий пользователя.
 *
 * Передаёт payload из контроллера в `GetCategoriesHandler`.
 *
 * @param userId ID владельца (из `@CurrentUser()`).
 */
export class GetCategoriesQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
