// Учётные данные пользователя, которые модуль users отдаёт наружу для аутентификации.
// Явный тип, чтобы Prisma-модель не протекала в другие модули.
export interface UserCredentials {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}