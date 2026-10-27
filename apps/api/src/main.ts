import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Точка входа NestJS-приложения.
 *
 * Создаёт приложение, включает CORS для фронтенда, глобальную валидацию DTO,
 * Swagger/OpenAPI на `/api/docs` и запускает HTTP-сервер на порту `PORT` (по
 * умолчанию 3001).
 */
async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);

	// Включение CORS для фронтенда Next.js.
	app.enableCors({
		origin: ['http://localhost:3000'],
		credentials: true,
	});

	// Глобальная валидация DTO: whitelist (отбросить лишние), forbidNonWhitelisted
	// (ошибка на не-объявленные поля), transform (преобразование query-параметров).
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	// Swagger/OpenAPI: http://localhost:3001/api/docs
	const swaggerConfig = new DocumentBuilder()
		.setTitle('Трекер расходов API')
		.setDescription('REST API трекера личных расходов')
		.setVersion('0.0.1')
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup('api/docs', app, document);

	const port = Number(process.env.PORT) || 3001;
	await app.listen(port);
}

void bootstrap();
