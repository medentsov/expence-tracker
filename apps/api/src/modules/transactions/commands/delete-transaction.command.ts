import { ICommand } from '@nestjs/cqrs';

export class DeleteTransactionCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
