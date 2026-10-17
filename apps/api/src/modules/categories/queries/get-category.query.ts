import { IQuery } from '@nestjs/cqrs';

export class GetCategoryQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}