import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Категория — форма ответа API (`GET /categories`, `GET /categories/:id`, POST/PATCH).
 *
 * Зеркалит интерфейс `Category` из `@tracker/shared`. Полная модель Prisma
 * (включая `userId` — владельца).
 */
export class CategoryResponseDto {
  /** UUID категории. */
  @ApiProperty({ example: '99308771-8bda-4a0a-8a1b-ce3e9c747958' })
  id!: string;

  /** Название категории. */
  @ApiProperty({ example: 'Продукты' })
  name!: string;

  /** Эмодзи-иконка (необязательно). */
  @ApiPropertyOptional({ example: '🛒', nullable: true, type: String })
  icon?: string | null;

  /** HEX-цвет (необязательно). */
  @ApiPropertyOptional({ example: '#FF5722', nullable: true, type: String })
  color?: string | null;

  /** UUID владельца категории. */
  @ApiProperty({ example: '553825aa-57d3-4f47-9579-2a2ce3647d14' })
  userId!: string;

  /** Дата создания (ISO 8601). */
  @ApiProperty({ example: '2026-10-17T14:44:11.461Z' })
  createdAt!: string;

  /** Дата последнего обновления (ISO 8601). */
  @ApiProperty({ example: '2026-10-17T14:44:11.461Z' })
  updatedAt!: string;
}
