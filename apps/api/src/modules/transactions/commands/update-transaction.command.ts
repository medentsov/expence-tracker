import { ICommand } from '@nestjs/cqrs';
import type { TransactionType } from '@prisma/client';

export class UpdateTransactionCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
    public readonly amount?: number,
    public readonly type?: TransactionType,
    public readonly date?: string,
    public readonly categoryId?: string,
    public readonly description?: string,
  ) {}
}
