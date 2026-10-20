import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Вложенная категория расхода (форма ответа API).
 */
export class ExpenseCategoryDto {
  /** UUID категории. */
  @ApiProperty({ example: '99308771-8bda-4a0a-8a1b-ce3e9c747958' })
  id!: string;

  /** Название категории. */
  @ApiProperty({ example: 'Продукты' })
  name!: string;

  /** Эмодзи-иконка категории (необязательно). */
  @ApiPropertyOptional({ example: '🛒', nullable: true, type: String })
  icon?: string | null;

  /** HEX-цвет категории (необязательно). */
  @ApiPropertyOptional({ example: '#22c55e', nullable: true, type: String })
  color?: string | null;

  /** Дата создания (ISO 8601). */
  @ApiProperty({ example: '2026-10-17T14:44:11.461Z' })
  createdAt!: string;

  /** Дата последнего обновления (ISO 8601). */
  @ApiProperty({ example: '2026-10-17T14:44:11.461Z' })
  updatedAt!: string;
}

/**
 * Расход — форма ответа API (`GET /expenses`, `GET /expenses/:id`).
 *
 * Зеркалит интерфейс `Expense` из `@tracker/shared`. Для legacy-модуля `expenses`
 * присутствует поле `currency` (в отличие от `transactions`).
 */
export class ExpenseResponseDto {
  /** UUID расхода. */
  @ApiProperty({ example: '1845d52e-0918-4949-ac9e-67353836ab18' })
  id!: string;

  /** Сумма расхода (Decimal(12,2) → number). */
  @ApiProperty({ example: 1250.5 })
  amount!: number;

  /** Валюта (по умолчанию RUB). */
  @ApiProperty({ example: 'RUB' })
  currency!: string;

  /** Комментарий (необязательно). */
  @ApiPropertyOptional({ example: 'Кофе в кафе', nullable: true, type: String })
  note?: string | null;

  /** Дата расхода (ISO 8601). */
  @ApiProperty({ example: '2026-10-08T00:00:00.000Z' })
  date!: string;

  /** UUID категории. */
  @ApiProperty({ example: '99308771-8bda-4a0a-8a1b-ce3e9c747958' })
  categoryId!: string;

  /** Вложенная категория. */
  @ApiProperty({ type: ExpenseCategoryDto })
  category?: ExpenseCategoryDto;

  /** Дата создания (ISO 8601). */
  @ApiProperty({ example: '2026-10-17T14:44:11.693Z' })
  createdAt!: string;

  /** Дата последнего обновления (ISO 8601). */
  @ApiProperty({ example: '2026-10-17T14:44:11.693Z' })
  updatedAt!: string;
}
