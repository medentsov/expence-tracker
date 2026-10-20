import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

/**
 * Тело создания транзакции (`POST /transactions`).
 *
 * Валидируется глобальным `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`).
 * Поля соответствуют `CreateTransactionCommand` → Prisma-модели `Transaction`.
 *
 * @remarks В отличие от `Expense`, у транзакции нет поля `currency` — единая
 *          валюта `RUB` (по соглашению проекта).
 */
export class CreateTransactionDto {
  /** Сумма транзакции (Decimal(12,2), строго > 0). */
  @ApiProperty({ example: 1250.5, description: 'Сумма транзакции' })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  /** Тип транзакции: доход или расход. */
  @ApiProperty({ enum: TransactionType, example: 'EXPENSE', description: 'Тип: доход или расход' })
  @IsEnum(TransactionType)
  type!: TransactionType;

  /** Описание (необязательно, до 500 символов). */
  @ApiPropertyOptional({ example: 'Покупка продуктов', description: 'Описание' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  /** Дата транзакции в ISO 8601. */
  @ApiProperty({ example: '2026-10-12', description: 'Дата транзакции (ISO 8601)' })
  @IsDateString()
  date!: string;

  /** UUID категории. */
  @ApiProperty({ description: 'ID категории' })
  @IsUUID()
  categoryId!: string;
}
