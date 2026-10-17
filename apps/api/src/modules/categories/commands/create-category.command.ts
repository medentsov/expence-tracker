import { ICommand } from '@nestjs/cqrs';

export class CreateCategoryCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly icon?: string,
    public readonly color?: string,
  ) {}
}