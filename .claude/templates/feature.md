# новая функциональность

## Контекст
Проект: 

Фронтенд	Next.js 15.5 (App Router), React 19, TypeScript
UI	shadcn/ui 4.x (new-york), Tailwind CSS v4, radix-ui, cn (clsx + tailwind-merge)
Формы	react-hook-form 7.90 + zod 4.6 + @hookform/resolvers 5.9
Тосты	sonner 2.0
Бэкенд	NestJS 10, TypeScript
Архитектура бэкенда	CQRS (@nestjs/cqrs) — CommandBus/QueryBus/EventBus
Авторизация	JWT (bcryptjs, @nestjs/jwt), без passport
БД	PostgreSQL 16 (Docker)
ORM	Prisma 5.22
API-документация	Swagger (на /api/docs, порт 3001)
Общие типы	@tracker/shared (внутренний пакет)
Монорепо	npm workspaces + Turborepo 2.11
Архитектура фронтенда	Feature-Sliced Design (FSD) — слои: app → views → features → entities → shared
Пакетный менеджер	npm 12, Node.js 26
Линтер/форматер	ESLint 9 (flat config) + Prettier

Что уже есть:
User, авторизация JWT, модуль категорий + frontend авторизации

## Задача
[]

## Модель данных
[]

## Контроллер 
[]

## Паттерн
Используй apps/api/src/modules/categories как образец для структуры для
backend

## Ограничения
- Не добавляй зависимости если не указано в задаче
- Используй class-validator для DTO
- После реализации собирай проект


