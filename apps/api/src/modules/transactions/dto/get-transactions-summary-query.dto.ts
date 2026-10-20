import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

/**
 * Query-параметры сводки за месяц (`GET /transactions/summary`).
 *
 * Оба параметра обязательны. С `transform: true` конвертируются в `number`,
 * диапазоны контролируются `@Min`/`@Max`.
 */
export class GetTransactionsSummaryQueryDto {
  /** Месяц (1–12). */
  @ApiProperty({ example: 10, description: 'Месяц (1–12)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  /** Год (≥ 2000). */
  @ApiProperty({ example: 2026, description: 'Год' })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year!: number;
}
