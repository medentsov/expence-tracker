import { SetMetadata } from '@nestjs/common';

/**
 * Ключ метаданных, помечающий эндпоинт как публичный (не требует JWT).
 *
 * Используется декоратором `@Public()` и читается глобальным `JwtAuthGuard`
 * через `Reflector` для обхода авторизации.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Помечает контроллер/метод как публичный — глобальный `JwtAuthGuard` пропустит его
 * без проверки Bearer-токена. Применяется к `POST /auth/register` и `POST /auth/login`.
 *
 * @returns Метуданные `{ isPublic: true }`.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
