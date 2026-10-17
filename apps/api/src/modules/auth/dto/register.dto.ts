import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email пользователя' })
  @IsEmail()
  email!: string;

  // 72 символа — лимит bcrypt на длину пароля.
  @ApiProperty({ example: 'strongPassword123', minLength: 8, maxLength: 72, description: 'Пароль' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiPropertyOptional({ example: 'Александр', description: 'Имя пользователя' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}