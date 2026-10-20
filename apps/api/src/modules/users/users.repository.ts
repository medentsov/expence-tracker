import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Слой доступа к данным пользователя.
 *
 * Единственное место, где выполняется Prisma-логика для модели `User`;
 * сервисы работают только через этот репозиторий. Работает с PrismaService
 * (глобальный модуль).
 */
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создаёт пользователя.
   *
   * @param data Данные для создания (`Prisma.UserCreateInput`: email, passwordHash, name?).
   *
   * @returns Созданного пользователя `User` (полная Prisma-модель).
   */
  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  /**
   * Находит пользователя по email.
   *
   * @param email Email пользователя.
   *
   * @returns Пользователя `User` или `null`, если не найден.
   */
  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Находит пользователя по id.
   *
   * @param id UUID пользователя.
   *
   * @returns Пользователя `User` или `null`, если не найден.
   */
  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Проверяет существование пользователя по email.
   *
   * @param email Email пользователя.
   *
   * @returns `true`, если пользователь с таким email существует.
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }
}
