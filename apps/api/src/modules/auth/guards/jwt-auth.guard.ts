import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Глобальный guard авторизации (зарегистрирован через `APP_GUARD`).
 *
 * Пропускает эндпоинты, помеченные `@Public()`. Для остальных извлекает Bearer-токен,
 * верифицирует его через `JwtService` и кладёт пользователя в `request.user`.
 *
 * @throws `UnauthorizedException` — токен отсутствует или невалиден.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly reflector: Reflector,
	) {}

	/**
	 * Решает, можно ли выполнить обработчик для данного запроса.
	 *
	 * @param context Контекст выполнения (`ExecutionContext`).
	 *
	 * @returns `true`, если эндпоинт публичный или токен валиден.
	 *
	 * @throws `UnauthorizedException` — отсутствует Bearer-токен
	 *         (`Требуется авторизация`) или токен невалиден (`Недействительный токен`).
	 */
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest<Request>();
		const token = this.extractBearerToken(request);
		if (!token) {
			throw new UnauthorizedException('Требуется авторизация');
		}

		try {
			const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
			request.user = { id: payload.sub, email: payload.email, name: payload.name };
			return true;
		} catch {
			throw new UnauthorizedException('Недействительный токен');
		}
	}

	/**
	 * Извлекает Bearer-токен из заголовка `Authorization`.
	 *
	 * @param request HTTP-запрос Express.
	 *
	 * @returns Токен строка, если заголовок вида `Bearer <token>`, иначе `undefined`.
	 */
	private extractBearerToken(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
