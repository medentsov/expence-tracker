import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Глобальный модуль доступа к Prisma.
 *
 * `@Global()` делает `PrismaService` доступным во всех модулях без явного
 * импорта — feature-модули (`categories`, `expenses`, `transactions`) внедряют
 * его напрямую в конструкторы хендлеров.
 *
 * Провайдер: `PrismaService`; экспортируется для DI.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
