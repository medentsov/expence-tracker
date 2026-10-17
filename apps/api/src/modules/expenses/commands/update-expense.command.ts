import { ICommand } from '@nestjs/cqrs';

export class UpdateExpenseCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
    public readonly amount?: number,
    public readonly currency?: string,
    public readonly note?: string,
    public readonly date?: string,
    public readonly categoryId?: string,
  ) {}
}