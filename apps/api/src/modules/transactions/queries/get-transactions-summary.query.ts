import { IQuery } from '@nestjs/cqrs';

export class GetTransactionsSummaryQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly month: number,
    public readonly year: number,
  ) {}
}
