import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Сервис доступа к базе данных (PostgreSQL) через Prisma.
 *
 * Наследник `PrismaClient` — предоставляет примитивы доступа (`user`, `category`,
 * `expense`, `transaction`) CQRS-хендлерам. Управляет жизненным циклом подключения:
 * `$connect()` при старте (`onModuleInit`), `$disconnect()` при завершении
 * (`onModuleDestroy`).
 *
 * Глобальный модуль (`@Global` в `PrismaModule`), внедряется без явного импорта.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(PrismaService.name);

	/**
	 * Устанавливает подключение к PostgreSQL при старте приложения.
	 *
	 * @throws Ошибку соединения, если БД недоступна.
	 */
	async onModuleInit(): Promise<void> {
		await this.$connect();
		this.logger.log('Подключение к PostgreSQL установлено');
	}

	/**
	 * Закрывает подключение к БД при завершении приложения.
	 */
	async onModuleDestroy(): Promise<void> {
		await this.$disconnect();
	}
}
