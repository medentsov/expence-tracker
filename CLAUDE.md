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
        └────── @tracker/shared ──────┘        (общие типы Category/Expense/CurrencyCode/User)
```

Специфика каждого воркспейса — во вложенных `CLAUDE.md`:
- **[`apps/api/CLAUDE.md`](apps/api/CLAUDE.md)** — bootstrap, CQRS-модули, Prisma, ownership-проверки, JWT, пагинация, DTO.
- **[`apps/web/CLAUDE.md`](apps/web/CLAUDE.md)** — FSD-слои, роуты, `apiFetch`, shadcn/Tailwind v4, паттерны feature/entity-слайсов, сессия.

### Общий код (`packages/shared`)

- Точка входа `src/index.ts`; типы в `src/types/` (`category.ts`, `expense.ts`, `transaction.ts`, `currency.ts`, `user.ts`, `pagination.ts` с `Paginated<T>`).
- Импортируется как `@tracker/shared`. Типы — интерфейсы, зеркалящие ответы API. Держать в синхронизации с DTO бэкенда (`apps/api/src/modules/*/dto`).

## Важные соглашения

- **Скрипты бэкенда/фронта** различаются: у API `lint` = `eslint "src/**/*.{ts,tsx}"`, у web `lint` = `next lint`.
- **Единая валюта** — `RUB` по умолчанию; поддерживаются `RUB | USD | EUR` (`CurrencyCode` в `packages/shared`).
- **CORS** в `main.ts` разрешает только `http://localhost:3000` — при развёртывании добавить домен фронта.
- `tsconfig.base.json` в корне — общий strict-конфиг; воркспейсы его расширяют (web — bundler, api — commonjs/node).

## Окружение и git

- `node_modules/`, `.next/`, `dist/`, `pgdata/` — в `.gitignore` (не коммитятся). `pgdata/` создаёт Docker (владелец root) — ручками не трогать.
- `package-lock.json` — коммитить (он не игнорируется).
- `apps/api/.env` — локальный, создаётся из `apps/api/.env.example` и в git не попадает (`DATABASE_URL`, `PORT`). Внешние переменные окружения брать из него, а не зашивать в код.
- Git-identity настроен локально (`user.name` = Alexander Medentsov).
- **Память Claude Code** хранится локально в `.claude/memory/` (в папке проекта, не глобально) и в git не попадает (в `.gitignore`). Файлы памяти: `MEMORY.md` (индекс) + отдельные `.md`-файлы с frontmatter (`type: user|feedback|project|reference`).
- **Коммиты** — формат Conventional Commits: `<type>: <описание>` (типы `feat`, `fix`, `chore`, `docs`, `refactor`, `test`; опционально scope — `feat(api)`, `feat(web)`). Сообщение — на русском. Каждое сообщение завершать строкой `Co-Authored-By: Claude Code <noreply@anthropic.com>`. Коммитить **только по явному запросу** пользователя, не автоматически по завершении задачи.

## Ветки и рабочий процесс (GitHub Flow)

- `main` — всегда рабочая ветка: код в ней должен собираться (`npm run build`), проходить `npm run lint` и `npm run typecheck`. Прямые коммиты в `main` запрещены.
- Каждая новая фича/исправление — в отдельной ветке от актуального `main`. Имя ветки — `<type>/<краткое-описание-в-kebab-case>`, где `<type>` из Conventional Commits: `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/`. Пример: `feat/main-screen-frontend`.
- Перед созданием ветки — переключиться на `main` и обновить её (`git pull`/`git fetch`); ветка создаётся от свежего `main`.
- В ветке — небольшие атомарные коммиты с Conventional Commits (см. выше). Одна ветка — одна фича; не смешивать несвязанные изменения.
- Завершённая работа mergится в `main` через Pull Request (не напрямую). Перед PR — ветка перебазируется/мержится с актуальным `main`, проверки (`npm run typecheck`, `npm run lint`, `npm run build`) проходят зелёными.
- **Pull Request** создаётся через `gh pr create`. Заголовок — по Conventional Commits (тип + scope + описание, на русском: `feat(web): главный экран с пагинацией транзакций`). В тело PR включать: что реализовано (инпойнты/экраны/эндпоинты), ключевые изменения по слоям (shared/api/web), как проверить (`npm run dev`, тестовые данные), и что осталось/следующие шаги. Описание завершать строкой `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- После мержа ветка удаляется; новая фича начинается с новой ветки от обновлённого `main`.
- Ветку создаёт/переключает агент сразу при старте новой фичи; PR создаётся только по явному запросу пользователя.
