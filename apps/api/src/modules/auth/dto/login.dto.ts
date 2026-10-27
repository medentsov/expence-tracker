import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * Тело входа (`POST /auth/login`).
 */
export class LoginDto {
	/** Email пользователя. */
	@ApiProperty({ example: 'user@example.com', description: 'Email пользователя' })
	@IsEmail()
	email!: string;

	/**
	 * Пароль.
	 *
	 * Для входа не проверяем минимальную длину — важен лишь факт совпадения.
	 */
	@ApiProperty({ example: 'strongPassword123', description: 'Пароль' })
	@IsString()
	@IsNotEmpty()
	password!: string;
}
