import { IQuery } from '@nestjs/cqrs';

/**
 * Запрос учётных данных пользователя по email.
 *
 * Используется `auth` (LoginHandler) через шину `QueryBus` для аутентификации.
 *
 * @param email Email пользователя.
 */
export class GetUserByEmailQuery implements IQuery {
  constructor(public readonly email: string) {}
}
