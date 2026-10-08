import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Глобальный модуль: PrismaService доступен без явного импорта в каждом модуле.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}