import { IQuery } from '@nestjs/cqrs';

export class GetTransactionQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
