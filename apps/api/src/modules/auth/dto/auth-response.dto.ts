import { ApiProperty } from '@nestjs/swagger';
import type { User } from '@tracker/shared';

/**
 * Публичный профиль пользователя (Swagger-схема ответов auth).
 *
 * Зеркалит интерфейс `User` из `@tracker/shared` для отображения в OpenAPI
 * (без `passwordHash` — служебное поле вычищено).
 */
export class PublicUserDto {
	/** UUID пользователя. */
	@ApiProperty({ example: 'bf7e...' })
	id!: string;

	/** Email пользователя. */
	@ApiProperty({ example: 'user@example.com' })
	email!: string;

	/** Имя пользователя (может отсутствовать). */
	@ApiProperty({ example: 'Александр', nullable: true })
	name!: string | null;

	/** Дата создания (ISO 8601). */
	@ApiProperty()
	createdAt!: string;

	/** Дата последнего обновления (ISO 8601). */
	@ApiProperty()
	updatedAt!: string;
}

/**
 * Ответ на успешный вход/регистрацию (`POST /auth/login`, `POST /auth/register`).
 */
export class AuthResponseDto {
	/** JWT access-токен для авторизации. */
	@ApiProperty({ description: 'JWT access-токен' })
	accessToken!: string;

	/** Полный публичный профиль пользователя. */
	@ApiProperty({ type: PublicUserDto })
	user!: User;
}
