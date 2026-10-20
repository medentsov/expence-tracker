import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

/**
 * Вложенная категория транзакции (форма ответа API).
 *
 * Возвращается вместе с транзакцией в списке/детальной выдаче.
 */
export class TransactionCategoryDto {
  /** UUID категории. */
  @ApiProperty({ example: '99308771-8bda-4a0a-8a1b-ce3e9c747958' })
  id!: string;

  /** Название категории. */
  @ApiProperty({ example: 'Продукты' })
  name!: string;

  /** Эмодзи/иконка категории (необязательно). */
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
 * Транзакция — форма ответа API (`GET /transactions`, `GET /transactions/:id`).
 *
 * Зеркалит интерфейс `Transaction` из `@tracker/shared`: `amount` — число
 * (Prisma Decimal приведён к number), даты — ISO-строки, категория вложена.
 */
export class TransactionResponseDto {
  /** UUID транзакции. */
  @ApiProperty({ example: '1845d52e-0918-4949-ac9e-67353836ab18' })
  id!: string;

  /** Сумма транзакции (Decimal(12,2) → number). */
  @ApiProperty({ example: 1200 })
  amount!: number;

  /** Тип транзакции: доход или расход. */
  @ApiProperty({ enum: TransactionType, example: 'EXPENSE' })
  type!: TransactionType;

  /** Описание транзакции (необязательно). */
  @ApiPropertyOptional({ example: 'Покупка продуктов', nullable: true, type: String })
  description?: string | null;

  /** Дата транзакции (ISO 8601). */
  @ApiProperty({ example: '2026-10-12T00:00:00.000Z' })
  date!: string;

  /** UUID категории. */
  @ApiProperty({ example: '99308771-8bda-4a0a-8a1b-ce3e9c747958' })
  categoryId!: string;

  /** Вложенная категория. */
  @ApiProperty({ type: TransactionCategoryDto })
  category?: TransactionCategoryDto;

  /** Дата создания (ISO 8601). */
  @ApiProperty({ example: '2026-10-17T14:44:11.693Z' })
  createdAt!: string;

  /** Дата последнего обновления (ISO 8601). */
  @ApiProperty({ example: '2026-10-17T14:44:11.693Z' })
  updatedAt!: string;
}

/**
 * Постраничный ответ списка транзакций (`GET /transactions`).
 *
 * Зеркалит интерфейс `Paginated<Transaction>` из `@tracker/shared`
 * (offset-пагинация).
 */
export class PaginatedTransactionsResponseDto {
  /** Элементы текущей страницы. */
  @ApiProperty({ type: [TransactionResponseDto] })
  items!: TransactionResponseDto[];

  /** Общее количество транзакций (по текущим фильтрам). */
  @ApiProperty({ example: 12 })
  total!: number;

  /** Номер текущей страницы (с 1). */
  @ApiProperty({ example: 1 })
  page!: number;

  /** Размер страницы. */
  @ApiProperty({ example: 10 })
  limit!: number;
}
