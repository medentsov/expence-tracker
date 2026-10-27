import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsHexColor, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Тело создания категории (`POST /categories`).
 *
 * Валидируется глобальным `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`).
 */
export class CreateCategoryDto {
	/** Название категории (до 100 символов). */
	@ApiProperty({ example: 'Продукты', description: 'Название категории' })
	@IsString()
	@MaxLength(100)
	name!: string;

	/** Эмодзи-иконка (необязательно, до 16 символов). */
	@ApiProperty({ required: false, example: '🛒', description: 'Эмодзи-иконка' })
	@IsOptional()
	@IsString()
	@MaxLength(16)
	icon?: string;

	/** HEX-цвет категории (необязательно). */
	@ApiPropertyOptional({ example: '#FF5722', description: 'Цвет категории (HEX)' })
	@IsOptional()
	@IsHexColor()
	color?: string;
}
