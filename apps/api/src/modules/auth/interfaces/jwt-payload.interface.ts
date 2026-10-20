/**
 * Полезная нагрузка JWT-токена.
 *
 * `sub` — id пользователя (по стандарту JWT). Подписывается в `TokenService` и
 * проверяется в `JwtAuthGuard`.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
}

/**
 * Аутентифицированный пользователь, положенный в `request.user` глобальным guard'ом.
 *
 * Отличается от {@link JwtPayload}: поле `id` (а не `sub`) — для удобства доступа
 * в контроллерах через `@CurrentUser()`.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
}
