import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/**
 * Тело создания расхода (`POST /expenses`).
 *
 * Валидируется глобальным `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`).
 *
 * ⚠️ Legacy-модуль: у `expenses` есть поле `currency` (в отличие от `transactions`),
 * где единая валюта `RUB` без поля `currency`.
 */
export class CreateExpenseDto {
  /** Сумма расхода (Decimal(12,2)). */
  @ApiProperty({ example: 1250.5, description: 'Сумма расхода' })
  @IsNumber()
  amount!: number;

  /** Валюта (необязательно, до 3 символов, по умолчанию RUB). */
  @ApiPropertyOptional({ example: 'RUB', default: 'RUB', description: 'Валюта' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  /** Комментарий (необязательно, до 500 символов). */
  @ApiPropertyOptional({ example: 'Кофе в кафе', description: 'Комментарий' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  /** Дата расхода в ISO 8601 (необязательно). */
  @ApiPropertyOptional({ example: '2026-10-08', description: 'Дата расхода (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  date?: string;

  /** UUID категории. */
  @ApiProperty({ description: 'ID категории' })
  @IsUUID()
  categoryId!: string;
}
