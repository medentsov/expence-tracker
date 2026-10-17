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

### Бэкенд (`apps/api`)

- Вход: `src/main.ts` — bootstrap; глобальный `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`), Swagger на `/api/docs`, CORS для `localhost:3000`.
- `src/prisma/` — `PrismaModule` (`@Global`) и `PrismaService` (наследник `PrismaClient`; `$connect` в `onModuleInit`, `$disconnect` в `onModuleDestroy`). Подключается свободно, без явного импорта.
- **CQRS**: `CqrsModule.forRoot()` в `AppModule` регистрирует шины (`CommandBus`/`QueryBus`/`EventBus`) глобально. Модули взаимодействуют **только через шины**, без прямых импортов друг друга. Контроллеры транслируют DTO в команды/запросы; хендлеры (`@CommandHandler`/`@QueryHandler`/`@EventsHandler`) живут в модуле-владельце данных и находятся глобально через `ExplorerService`. Каждый feature-модуль: `*.module.ts`, `*.controller.ts`, `commands/`, `queries/`, `events/`, `dto/`. Фичи: `categories`, `expenses`, `users`, `auth`.
- `auth` — JWT-авторизация: `POST /auth/register`, `POST /auth/login` (публичные, `@Public()`), `GET /auth/me` (данные из JWT). Глобальный `JwtAuthGuard` (`APP_GUARD` в `AuthModule`) защищает все роуты; секрет и срок жизни токена — из `JWT_SECRET`/`JWT_EXPIRES_IN` (`.env`, `JwtModule.registerAsync` с fail-fast). Пароли — `bcryptjs` (cost 10). Подпись токена — `TokenService`; `RegisterHandler` создаёт пользователя через `CreateUserCommand` (шина), `LoginHandler` читает учётные данные через `GetUserByEmailQuery`.
- `users` — владелец данных о пользователях: `UserRepository` (Prisma-доступ) + `UsersService` (`toPublicUser` вычищает `passwordHash`). Наружу ничего не экспортирует — только хендлеры через шину. Публикует `UserRegisteredEvent` при регистрации.
- `categories`/`expenses` — хендлеры работают с `PrismaService` напрямую; `userId` приходит из `@CurrentUser()` через команду/запрос, выборки фильтруются по `userId` (чужая запись → 404).
- Prisma-схема: `prisma/schema.prisma` — модели `User` (с `passwordHash`), `Category`, `Expense`, поля с `@db.Decimal(12, 2)`, UID-ключи, связи с `onDelete`.

### Фронтенд (`apps/web`)

- App Router поверх `src/app/` (Next сам находит `src/`); страницы — в групповых layout'ах `(auth)` (публичные) и `(protected)` (приватные).
- **Feature-Sliced Design (FSD)** — слои в `src/`: `app` (роутинг/layouts/guards) → `views` (страницы) → `features` (действия) → `entities` (домен) → `shared` (переиспользуемый код). Правило импортов — **только «вниз»** (вышестоящий слой видит нижестоящие), кросс-импорты внутри слоя запрещены. Каждый слайс отдаёт публичный API через `index.ts`.
  - Слой pages FSD назван **`views`**, чтобы не конфликтовать с Pages Router Next.js.
  - `shared` — инфраструктура: `api` (типизированный `fetch` — `apiFetch`, `ApiError`), `config` (env), `lib` (утилиты, `cn`), `ui` (shadcn-компоненты).
  - `entities/session` — JWT-сессия: контекст `SessionProvider`/`useSession` поверх `localStorage`; токен под ключом `tracker.accessToken`, полный профиль кэшируется в `tracker.user`.
  - `features/auth-login`, `features/auth-register` — формы входа/регистрации (`react-hook-form` + `zod`).
- Алиас `@/*` → `apps/web/src/*` (в `apps/web/tsconfig.json` `paths`). `@tracker/shared` резолвится через `next.config.ts` (`transpilePackages`).
- **UI** — shadcn/ui + Tailwind CSS v4 (без `tailwind.config.js` — тема в `globals.css` через `@theme`). Компоненты добавляются `npx shadcn@latest add <name>` из `apps/web` и кладутся в `src/shared/ui` (aliases в `components.json`).
- **Сессия/API**: токен передаётся заголовком `Authorization: Bearer …`; `GET /auth/me` возвращает **JWT-payload** (`{sub,email,name}`), а не `User` — полный профиль берётся из ответов login/register. Базовый URL API — `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`), файл `apps/web/.env.example`.

### Общий код (`packages/shared`)

- Точка входа `src/index.ts`; типы в `src/types/` (`category.ts`, `expense.ts`, `currency.ts`, `user.ts`).
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
- **Коммиты** — формат Conventional Commits: `<type>: <описание>` (типы `feat`, `fix`, `chore`, `docs`, `refactor`, `test`; опционально scope — `feat(api)`, `feat(web)`). Сообщение — на русском. Каждое сообщение завершать строкой `Co-Authored-By: Claude Code <noreply@anthropic.com>`. Коммитить **только по явному запросу** пользователя, не автоматически по завершении задачи.
