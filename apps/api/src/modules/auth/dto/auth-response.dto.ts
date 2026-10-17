import { ApiProperty } from '@nestjs/swagger';
import type { User } from '@tracker/shared';

// Публичный профиль пользователя в Swagger-схеме ответов auth.
export class PublicUserDto {
  @ApiProperty({ example: 'bf7e...' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'Александр', nullable: true })
  name!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

// Ответ на успешный вход/регистрацию.
export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access-токен' })
  accessToken!: string;

  @ApiProperty({ type: PublicUserDto })
  user!: User;
}