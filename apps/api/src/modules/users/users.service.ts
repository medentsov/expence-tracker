import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import type { User } from '@tracker/shared';
import { UserRepository } from './users.repository';

/**
 * Доменная обёртка над репозиторием пользователя.
 *
 * Работает с Prisma-моделью `User`, но наружу отдаёт только публичный профиль
 * (без `passwordHash` — через `toPublicUser`). Единственная точка «вычищения»
 * служебных полей перед отдачей наружу.
 */
@Injectable()
export class UsersService {
	constructor(private readonly usersRepository: UserRepository) {}

	/**
	 * Создаёт пользователя.
	 *
	 * @param data Данные (`{ email, passwordHash, name? }`).
	 *
	 * @returns Созданного пользователя `PrismaUser` (полная модель, вкл. `passwordHash`).
	 */
	createUser(data: { email: string; passwordHash: string; name?: string }): Promise<PrismaUser> {
		return this.usersRepository.create({
			email: data.email,
			passwordHash: data.passwordHash,
			name: data.name,
		});
	}

	/**
	 * Находит пользователя по email.
	 *
	 * @param email Email пользователя.
	 *
	 * @returns Полного пользователя `PrismaUser` (вкл. `passwordHash`) или `null`.
	 */
	findByEmail(email: string): Promise<PrismaUser | null> {
		return this.usersRepository.findByEmail(email);
	}

	/**
	 * Находит пользователя по id.
	 *
	 * @param id UUID пользователя.
	 *
	 * @returns Полного пользователя `PrismaUser` или `null`.
	 */
	findById(id: string): Promise<PrismaUser | null> {
		return this.usersRepository.findById(id);
	}

	/**
	 * Преобразует Prisma-модель в публичный профиль (без `passwordHash`).
	 *
	 * @param user Полная Prisma-модель `User`.
	 *
	 * @returns Публичный профиль `User` (даты → ISO-строки, `passwordHash` удалён).
	 */
	// Единственная точка «вычищения» служебных полей (passwordHash) перед отдачей наружу.
	toPublicUser(user: PrismaUser): User {
		return {
			id: user.id,
			email: user.email,
			name: user.name,
			createdAt: user.createdAt.toISOString(),
			updatedAt: user.updatedAt.toISOString(),
		};
	}
}
