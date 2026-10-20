import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { LoginHandler } from './commands/handlers/login.handler';
import { RegisterHandler } from './commands/handlers/register.handler';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TokenService } from './services/token.service';

/**
 * Модуль аутентификации.
 *
 * Настраивает JWT-подпись (`JwtModule.registerAsync` с fail-fast: отсутствие
 * `JWT_SECRET` в окружении роняет старт), регистрирует хендлеры входа/регистрации,
 * сервис подписи токенов и **глобальный** `JwtAuthGuard` ({@link APP_GUARD}),
 * который защищает все роуты приложения (публичные помечаются `@Public()`).
 *
 * Секрет и срок жизни токена берутся из `JWT_SECRET`/`JWT_EXPIRES_IN` (`.env`).
 * Регистрация/вход создают пользователя через шину (`CommandBus`) в модуль `users`.
 *
 * Зависимости: `@nestjs/jwt`, `@nestjs/core` (`APP_GUARD`), хендлеры/auth-библиотека.
 */
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET не задан в окружении');
        }
        return {
          secret,
          signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    TokenService,
    RegisterHandler,
    LoginHandler,
    // Глобальная защита всех роутов; публичные помечаются декоратором @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AuthModule {}
