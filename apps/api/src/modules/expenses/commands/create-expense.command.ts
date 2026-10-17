import { ICommand } from '@nestjs/cqrs';

export class CreateExpenseCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly categoryId: string,
    public readonly currency?: string,
    public readonly note?: string,
    public readonly date?: string,
  ) {}
}