import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Сервис подписи JWT-токенов.
 *
 * Общая ответственность хендлеров авторизации: инкапсулирует `JwtService`
 * (подписка через `signAsync`) с единым интерфейсом.
 *
 * Зависит от `@nestjs/jwt` (настроен в `AuthModule`).
 */
@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Подписывает JWT-токен из полезной нагрузки.
   *
   * @param payload Полезная нагрузка (`JwtPayload`: `{ sub, email, name? }`).
   *
   * @returns Строку JWT-токена.
   *
   * @throws Ошибку от `JwtService` при некорректном payload.
   */
  sign(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
