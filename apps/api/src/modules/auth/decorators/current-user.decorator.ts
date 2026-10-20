import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../interfaces/jwt-payload.interface';

/**
 * Декоратор параметра: достаёт аутентифицированного пользователя из `request.user`.
 *
 * Пользователя кладёт в `request` глобальный {@link JwtAuthGuard} после проверки
 * Bearer-токена. Используется во всех защищённых контроллерах:
 * `@CurrentUser() user: AuthenticatedUser`.
 *
 * @returns `AuthenticatedUser` (`{ id, email, name? }`) из `request.user`.
 *
 * @throws `Error` (типа request без `user`) — если guard не выполнился (например,
 *         эндпоинт не защищён или декоратор применён вне защищённого роута).
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as AuthenticatedUser;
  },
);
