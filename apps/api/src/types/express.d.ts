import type { AuthenticatedUser } from '../modules/auth/interfaces/jwt-payload.interface';

// Расширяем Express.Request полем user, которое заполняет JwtAuthGuard.
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};