import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import type { User } from '@tracker/shared';
import { UserRepository } from './users.repository';

// Доменная обёртка над репозиторием пользователя. Работает с Prisma-моделью,
// но наружу отдаёт только публичный профиль (без хэша пароля).
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UserRepository) {}

  createUser(data: { email: string; passwordHash: string; name?: string }): Promise<PrismaUser> {
    return this.usersRepository.create({
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
    });
  }

  findByEmail(email: string): Promise<PrismaUser | null> {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: string): Promise<PrismaUser | null> {
    return this.usersRepository.findById(id);
  }

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