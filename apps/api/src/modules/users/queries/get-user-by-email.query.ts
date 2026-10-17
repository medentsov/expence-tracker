import { IQuery } from '@nestjs/cqrs';

// Запрос учётных данных пользователя по email (для аутентификации).
export class GetUserByEmailQuery implements IQuery {
  constructor(public readonly email: string) {}
}