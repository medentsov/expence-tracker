import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { CreateExpenseCommand } from './commands/create-expense.command';
import { DeleteExpenseCommand } from './commands/delete-expense.command';
import { UpdateExpenseCommand } from './commands/update-expense.command';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { GetExpensesQuery } from './queries/get-expenses.query';
import { GetExpenseQuery } from './queries/get-expense.query';

@ApiTags('expenses')
@ApiBearerAuth()
@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateExpenseDto) {
    return this.commandBus.execute(
      new CreateExpenseCommand(
        user.id,
        dto.amount,
        dto.categoryId,
        dto.currency,
        dto.note,
        dto.date,
      ),
    );
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.queryBus.execute(new GetExpensesQuery(user.id));
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new GetExpenseQuery(user.id, id));
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.commandBus.execute(
      new UpdateExpenseCommand(
        user.id,
        id,
        dto.amount,
        dto.currency,
        dto.note,
        dto.date,
        dto.categoryId,
      ),
    );
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.commandBus.execute(new DeleteExpenseCommand(user.id, id));
  }
}