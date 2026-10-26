import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

/** Поля, по которым можно упорядочить список транзакций. */
export const TRANSACTION_SORT_FIELDS = ['name', 'date', 'amount', 'category'] as const;
export type TransactionSortField = (typeof TRANSACTION_SORT_FIELDS)[number];

/** Направления сортировки. */
export const TRANSACTION_SORT_ORDERS = ['asc', 'desc'] as const;
export type TransactionSortOrder = (typeof TRANSACTION_SORT_ORDERS)[number];

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

  /** Поле сортировки (по умолчанию `date`). */
  @ApiPropertyOptional({
    enum: TRANSACTION_SORT_FIELDS,
    description: 'Поле сортировки',
    default: 'date',
  })
  @IsOptional()
  @IsIn(TRANSACTION_SORT_FIELDS)
  sortBy?: TransactionSortField;

  /** Направление сортировки (по умолчанию `desc`). */
  @ApiPropertyOptional({
    enum: TRANSACTION_SORT_ORDERS,
    description: 'Направление сортировки',
    default: 'desc',
  })
  @IsOptional()
  @IsIn(TRANSACTION_SORT_ORDERS)
  sortOrder?: TransactionSortOrder;

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
