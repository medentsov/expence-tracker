import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({ example: 1250.5, description: 'Сумма расхода' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 'RUB', default: 'RUB', description: 'Валюта' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: 'Кофе в кафе', description: 'Комментарий' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({ example: '2026-10-08', description: 'Дата расхода (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ description: 'ID категории' })
  @IsUUID()
  categoryId: string;
}