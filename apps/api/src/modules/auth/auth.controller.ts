import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

// Заглушка: здесь появятся /register и /login в итерации авторизации.
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Get('status')
  status() {
    return { ok: true, message: 'Модуль авторизации ещё не реализован' };
  }
}