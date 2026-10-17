import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { CreateTransactionCommand } from './commands/create-transaction.command';
import { DeleteTransactionCommand } from './commands/delete-transaction.command';
import { UpdateTransactionCommand } from './commands/update-transaction.command';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';
import { GetTransactionsSummaryQueryDto } from './dto/get-transactions-summary-query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { GetTransactionQuery } from './queries/get-transaction.query';
import { GetTransactionsQuery } from './queries/get-transactions.query';
import { GetTransactionsSummaryQuery } from './queries/get-transactions-summary.query';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateTransactionDto) {
    return this.commandBus.execute(
      new CreateTransactionCommand(
        user.id,
        dto.amount,
        dto.type,
        dto.date,
        dto.categoryId,
        dto.description,
      ),
    );
  }

  // ⚠️ Порядок важен: сначала статические маршруты, потом динамические.
  @Get('summary')
  summary(@CurrentUser() user: AuthenticatedUser, @Query() query: GetTransactionsSummaryQueryDto) {
    return this.queryBus.execute(
      new GetTransactionsSummaryQuery(user.id, query.month, query.year),
    );
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: GetTransactionsQueryDto) {
    return this.queryBus.execute(
      new GetTransactionsQuery(
        user.id,
        query.dateFrom,
        query.dateTo,
        query.type,
        query.categoryId,
      ),
    );
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new GetTransactionQuery(user.id, id));
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.commandBus.execute(
      new UpdateTransactionCommand(
        user.id,
        id,
        dto.amount,
        dto.type,
        dto.date,
        dto.categoryId,
        dto.description,
      ),
    );
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.commandBus.execute(new DeleteTransactionCommand(user.id, id));
  }
}