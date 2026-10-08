# Трекер расходов

Монорепозиторий для трекера личных расходов.

## Стек

| Слой      | Технология                        |
|-----------|-----------------------------------|
| Фронтенд  | Next.js (App Router, TypeScript)  |
| Бэкенд    | NestJS (TypeScript)               |
| БД        | PostgreSQL                        |
| ORM       | Prisma                            |
| API       | REST + Swagger                    |
| Монорепо  | npm workspaces + Turborepo        |

## Структура

```
apps/
  web/   — Next.js фронтенд (@tracker/web)
  api/   — NestJS бэкенд (@tracker/api)
packages/
  shared/ — общие типы/DTO (@tracker/shared)
```

## Быстрый старт

```bash
# 1. Поднять PostgreSQL (Docker)
docker compose up -d db

# 2. Установить зависимости
npm install

# 3. Подготовить Prisma (в apps/api)
cd apps/api
npx prisma generate
npx prisma migrate dev

# 4. Запустить dev-серверы из корня
cd ../..
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:3001
- Swagger (API-документация): http://localhost:3001/api/docs

## Скрипты (корень)

| Команда        | Действие                        |
|----------------|---------------------------------|
| `npm run dev`  | Запуск dev-серверов (web + api) |
| `npm run build`| Сборка всех пакетов             |
| `npm run lint` | Линт всех воркспейсов           |
| `npm run typecheck` | Проверка типов            |