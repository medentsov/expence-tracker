import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ example: 1250.5, description: 'Сумма транзакции' })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ enum: TransactionType, example: 'EXPENSE', description: 'Тип: доход или расход' })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiPropertyOptional({ example: 'Покупка продуктов', description: 'Описание' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: '2026-10-12', description: 'Дата транзакции (ISO 8601)' })
  @IsDateString()
  date!: string;

  @ApiProperty({ description: 'ID категории' })
  @IsUUID()
  categoryId!: string;
}
