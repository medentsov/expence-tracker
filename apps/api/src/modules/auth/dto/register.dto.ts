import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Тело регистрации (`POST /auth/register`).
 */
export class RegisterDto {
	/** Email пользователя. */
	@ApiProperty({ example: 'user@example.com', description: 'Email пользователя' })
	@IsEmail()
	email!: string;

	/**
	 * Пароль (8–72 символа).
	 *
	 * 72 символа — лимит bcrypt на длину пароля.
	 */
	@ApiProperty({ example: 'strongPassword123', minLength: 8, maxLength: 72, description: 'Пароль' })
	@IsString()
	@MinLength(8)
	@MaxLength(72)
	password!: string;

	/** Имя пользователя (необязательно, до 100 символов). */
	@ApiPropertyOptional({ example: 'Александр', description: 'Имя пользователя' })
	@IsOptional()
	@IsString()
	@MaxLength(100)
	name?: string;
}
