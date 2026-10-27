import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Профиль текущего пользователя (`GET /auth/me`).
 *
 * Зеркалит интерфейс `AuthenticatedUser` — полезную нагрузку JWT, которую
 * `JwtAuthGuard` кладёт в `request.user`. Это **не** полный `User` (без
 * `createdAt`/`updatedAt` и без `passwordHash`).
 */
export class MeResponseDto {
	/** UUID пользователя (это `JwtPayload.sub`). */
	@ApiProperty({ example: 'bf7e...' })
	id!: string;

	/** Email пользователя. */
	@ApiProperty({ example: 'user@example.com' })
	email!: string;

	/** Имя пользователя (может отсутствовать). */
	@ApiPropertyOptional({ example: 'Александр', nullable: true })
	name?: string;
}
