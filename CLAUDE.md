# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Проект

Монорепозиторий **трекера личных расходов**. npm workspaces + Turborepo.

- **Фронтенд** `apps/web` — Next.js (App Router, TypeScript), имя пакета `@tracker/web`.
- **Бэкенд** `apps/api` — NestJS (TypeScript), имя пакета `@tracker/api`.
- **Общий код** `packages/shared` — типы/DTO, имя пакета `@tracker/shared`.
- **БД** — PostgreSQL через Prisma; локальный запуск в Docker Compose (`docker-compose.yml`, порт 5432).

## Типовые команды

Зависимости устанавливаются один раз из корня (npm workspaces):

```bash
npm install
```

```bash
# База данных: поднять PostgreSQL (Docker)
docker compose up -d db

# Запустить оба приложения в dev-режиме (web:3000, api:3001) — из корня
npm run dev

# Сборка всех пакетов
npm run build

# Линт / проверка типов по всем воркспейсам
npm run lint
npm run typecheck

# Форматирование
npm run format
```

### Внутри воркспейса `apps/api` (Prisma)

```bash
npx prisma generate     # сгенерировать Prisma Client после изменения schema.prisma
npx prisma migrate dev  # создать/применить миграции
npx prisma studio       # UI для просмотра данных
```

Команды можно запускать точечно: `npm run dev -w @tracker/api` — только API, `npm run dev -w @tracker/web` — только web.

## Архитектура

### Поток данных

```
Next.js (apps/web)  ──REST──►  NestJS (apps/api)  ──Prisma──►  PostgreSQL (Docker)
        │                              │
        └────── @tracker/shared ──────┘        (общие типы Category/Expense/CurrencyCode)
```

### Бэкенд (`apps/api`)

- Вход: `src/main.ts` — bootstrap; глобальный `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`), Swagger на `/api/docs`, CORS для `localhost:3000`.
- `src/prisma/` — `PrismaModule` (`@Global`) и `PrismaService` (наследник `PrismaClient`; `$connect` в `onModuleInit`, `$disconnect` в `onModuleDestroy`). Подключается свободно, без явного импорта.
- Бизнес-логика живёт в `src/modules/<feature>/` — каждый модуль состоит из `*.module.ts`, `*.controller.ts`, `*.service.ts` и `dto/`. Три фичи: `categories`, `expenses`, `auth`.
- `auth` — **заглушка** (JWT-авторизация ещё не реализована).
- Prisma-схема: `prisma/schema.prisma` — модели `User`, `Category`, `Expense`, поля с `@db.Decimal(12, 2)`, UID-ключи, связи с `onDelete`.

### Фронтенд (`apps/web`)

- App Router: корневой `app/layout.tsx` + `app/page.tsx`. Страницы — по папкам в `app/`.
- `components/` и `lib/` пока пусты (README-заглушки): сюда будут добавляться UI-компоненты и API-клиент.
- `next.config.ts` подключает `transpilePackages: ['@tracker/shared']` — чтобы общие типы резолвились в браузере.

### Общий код (`packages/shared`)

- Точка входа `src/index.ts`; типы в `src/types/` (`category.ts`, `expense.ts`, `currency.ts`).
- Импортируется как `@tracker/shared`. Типы — интерфейсы, зеркалящие ответы API. Держать в синхронизации с DTO бэкенда (`apps/api/src/modules/*/dto`).

## Важные соглашения

- **Скрипты бэкенда/фронта** различаются: у API `lint` = `eslint "src/**/*.{ts,tsx}"`, у web `lint` = `next lint`.
- **Единая валюта** — `RUB` по умолчанию; поддерживаются `RUB | USD | EUR` (`CurrencyCode` в `packages/shared`).
- **CORS** в `main.ts` разрешает только `http://localhost:3000` — при развёртывании добавить домен фронта.
- `tsconfig.base.json` в корне — общий strict-конфиг; воркспейсы его расширяют (web — bundler, api — commonjs/node).
