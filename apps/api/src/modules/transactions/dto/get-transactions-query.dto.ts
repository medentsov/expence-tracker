import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

/**
 * Query-параметры списка транзакций (`GET /transactions`).
 *
 * Все поля опциональны. С `transform: true` в `ValidationPipe` числовые параметры
 * (`page`/`limit`) конвертируются в `number` через `@Type(() => Number)`.
 */
export class GetTransactionsQueryDto {
  /** Нижняя граница даты (включительно). */
  @ApiPropertyOptional({ example: '2026-10-01', description: 'Нижняя граница даты (включительно)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  /** Верхняя граница даты (включительно). */
  @ApiPropertyOptional({ example: '2026-10-31', description: 'Верхняя граница даты (включительно)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  /** Фильтр по типу транзакции. */
  @ApiPropertyOptional({ enum: TransactionType, description: 'Фильтр по типу' })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  /** Фильтр по UUID категории. */
  @ApiPropertyOptional({ description: 'Фильтр по категории' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  /** Номер страницы (с 1, по умолчанию 1). */
  @ApiPropertyOptional({ example: 1, description: 'Номер страницы (с 1)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  /** Размер страницы (1–100, по умолчанию 10). */
  @ApiPropertyOptional({ example: 10, description: 'Размер страницы (1–100)', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
