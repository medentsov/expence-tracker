import { UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import type { AuthResponse } from '@tracker/shared';
import * as bcrypt from 'bcryptjs';
import { GetUserByEmailQuery } from '../../../users/queries/get-user-by-email.query';
import type { UserCredentials } from '../../../users/types/user-credentials';
import { TokenService } from '../../services/token.service';
import { LoginCommand } from '../login.command';

/**
 * Обработчик команды входа.
 *
 * Получает учётные данные по email через `GetUserByEmailQuery` (шина → модуль `users`),
 * сверяет пароль через bcrypt и выдаёт access-токен. Дата/время пользователя
 * приводятся к ISO-строкам для публичного ответа.
 *
 * @throws `UnauthorizedException` — пользователь не найден или пароль неверен
 *         (одинаковое сообщение против перебора).
 */
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, AuthResponse> {
	constructor(
		private readonly queryBus: QueryBus,
		private readonly tokenService: TokenService,
	) {}

	/**
	 * Выполняет вход.
	 *
	 * @param command Команда (`LoginCommand`) с email и паролем.
	 *
	 * @returns `AuthResponse`: `{ accessToken, user }` (полный публичный профиль).
	 *
	 * @throws `UnauthorizedException` — «Неверный email или пароль» для отсутствующего
	 *         пользователя и неверного пароля (одинаково, чтобы не раскрывать наличие).
	 */
	async execute(command: LoginCommand): Promise<AuthResponse> {
		const credentials = await this.queryBus.execute<GetUserByEmailQuery, UserCredentials | null>(
			new GetUserByEmailQuery(command.email),
		);

		// Одинаковое сообщение для «нет пользователя» и «неверный пароль» — против перебора.
		if (!credentials || !(await bcrypt.compare(command.password, credentials.passwordHash))) {
			throw new UnauthorizedException('Неверный email или пароль');
		}

		const accessToken = await this.tokenService.sign({
			sub: credentials.id,
			email: credentials.email,
			name: credentials.name ?? undefined,
		});

		return {
			accessToken,
			user: {
				id: credentials.id,
				email: credentials.email,
				name: credentials.name,
				createdAt: credentials.createdAt.toISOString(),
				updatedAt: credentials.updatedAt.toISOString(),
			},
		};
	}
}
