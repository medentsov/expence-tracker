// Полезная нагрузка JWT-токена (sub — id пользователя по стандарту JWT).
export interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
}

// Аутентифицированный пользователь, положенный в request нашим guard'ом.
export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
}