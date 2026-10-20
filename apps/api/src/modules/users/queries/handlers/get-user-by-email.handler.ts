import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { UserCredentials } from '../../types/user-credentials';
import { UsersService } from '../../users.service';
import { GetUserByEmailQuery } from '../get-user-by-email.query';

/**
 * Обработчик запроса учётных данных пользователя по email.
 *
 * Возвращает `UserCredentials` (вкл. `passwordHash`) для сверки пароля в `auth`,
 * либо `null`, если пользователь не найден. Отдаёт явный тип, а не Prisma-модель,
 * чтобы `User` не протекал в другие модули.
 */
@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler
  implements IQueryHandler<GetUserByEmailQuery, UserCredentials | null>
{
  constructor(private readonly usersService: UsersService) {}

  /**
   * Выполняет получение учётных данных.
   *
   * @param query Запрос (`GetUserByEmailQuery`) с `email`.
   *
   * @returns `UserCredentials` (вкл. `passwordHash`, даты `Date`) или `null`,
   *          если пользователь не найден.
   */
  async execute(query: GetUserByEmailQuery): Promise<UserCredentials | null> {
    const user = await this.usersService.findByEmail(query.email);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
