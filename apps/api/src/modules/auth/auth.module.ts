import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// Заглушка: модуль авторизации будет реализован в следующей итерации (JWT).
@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}