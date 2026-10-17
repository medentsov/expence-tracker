import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class GetTransactionsSummaryQueryDto {
  @ApiProperty({ example: 10, description: 'Месяц (1–12)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @ApiProperty({ example: 2026, description: 'Год' })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year!: number;
}
