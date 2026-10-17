import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class GetTransactionsQueryDto {
  @ApiPropertyOptional({ example: '2026-10-01', description: 'Нижняя граница даты (включительно)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-10-31', description: 'Верхняя граница даты (включительно)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ enum: TransactionType, description: 'Фильтр по типу' })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({ description: 'Фильтр по категории' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
