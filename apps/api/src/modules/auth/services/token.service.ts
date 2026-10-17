import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

// Подпись JWT-токенов — общая ответственность хендлеров авторизации.
@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}