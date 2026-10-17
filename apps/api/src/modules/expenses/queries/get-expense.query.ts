import { IQuery } from '@nestjs/cqrs';

export class GetExpenseQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}