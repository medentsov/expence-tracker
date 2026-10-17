import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email пользователя' })
  @IsEmail()
  email!: string;

  // Для входа не проверяем минимальную длину — важен лишь факт совпадения.
  @ApiProperty({ example: 'strongPassword123', description: 'Пароль' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}