import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { UserCredentials } from '../../types/user-credentials';
import { UsersService } from '../../users.service';
import { GetUserByEmailQuery } from '../get-user-by-email.query';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler
  implements IQueryHandler<GetUserByEmailQuery, UserCredentials | null>
{
  constructor(private readonly usersService: UsersService) {}

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