# Трекер расходов

Монорепозиторий **трекера личных расходов**: учёт доходов и расходов по категориям, сводка за месяц, авторизация. Фронтенд и бэкенд собраны через npm workspaces + Turborepo, общие типы вынесены в отдельный пакет.

## Стек

| Слой       | Технология                                     |
|------------|------------------------------------------------|
| Фронтенд   | Next.js 15 (App Router, TypeScript, Tailwind v4, shadcn/ui) |
| Бэкенд     | NestJS 10 (TypeScript, CQRS)                   |
| БД         | PostgreSQL 16 (Docker Compose)                 |
| ORM        | Prisma 5                                       |
| API        | REST + Swagger/OpenAPI                         |
| Auth       | JWT (Bearer-токен), bcryptjs                   |
| Монорепо   | npm workspaces + Turborepo                     |

## Требования

- **Node.js** ≥ 18.18 (рекомендуется последняя LTS)
- **npm** 10 (менеджер пакетов зафиксирован в `package.json`)
- **Docker** и Docker Compose — для локального PostgreSQL

## Структура проекта

```
.
├── apps/
│   ├── web/          # Next.js фронтенд (@tracker/web) — порт 3000
│   │   └── src/
│   │       ├── app/        # маршруты/layouts/guards (App Router)
│   │       ├── views/      # страницы (composition из features)
│   │       ├── features/   # действия (формы, хуки, UI)
│   │       ├── entities/   # домен (доступ к данным, сессия)
│   │       └── shared/     # инфраструктура (api, config, lib, ui)
│   └── api/           # NestJS бэкенд (@tracker/api) — порт 3001
│       ├── prisma/    # schema.prisma + миграции
│       └── src/
│           ├── main.ts          # bootstrap (CORS, ValidationPipe, Swagger)
│           ├── modules/         # auth, categories, expenses, transactions, users
│           └── prisma/          # PrismaModule + PrismaService
├── packages/
│   └── shared/        # общие типы/DTO (@tracker/shared)
├── docker-compose.yml # локальный PostgreSQL
├── tsconfig.base.json # общий strict-конфиг
└── eslint.config.js   # ESLint 9 (api + shared)
```

Фронтенд построен по методологии FSD (Feature-Sliced Design): импорты только «вниз», каждый слайс отдаёт публичный API через `index.ts`. Бэкенд — CQRS: модули общаются только через `CommandBus`/`QueryBus`/`EventBus`, данные изолируются по `userId`.

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Переменные окружения

Скопируйте `.env.example` в корне и в `apps/api`:

```bash
cp .env.example .env                          # корневой (локальная разработка)
cp apps/api/.env.example apps/api/.env        # переменные API (в git не попадает)
```

Основные переменные (из `apps/api/.env.example`):

| Переменная        | По умолчанию                                   | Назначение                                  |
|-------------------|------------------------------------------------|---------------------------------------------|
| `DATABASE_URL`    | `postgresql://postgres:postgres@localhost:5432/tracker` | Строка подключения к PostgreSQL      |
| `PORT`            | `3001`                                         | Порт NestJS API                              |
| `JWT_SECRET`      | `dev-secret-change-me-in-production`           | Секрет подписи JWT (заменить в проде)       |
| `JWT_EXPIRES_IN`  | `7d`                                           | Срок жизни access-токена                    |

Фронтенд использует `NEXT_PUBLIC_API_URL` (по умолчанию `http://localhost:3001`).

### 3. База данных (Docker)

```bash
docker compose up -d db
```

PostgreSQL 16 запускается на порту `5432`, данные хранятся в `./pgdata`.

### 4. Миграции Prisma

```bash
npm run prisma:generate -w @tracker/api    # сгенерировать Prisma Client
npm run prisma:migrate -w @tracker/api     # применить миграции
```

### 5. Dev-сервер

```bash
npm run dev    # запускает web и api параллельно (Turborepo)
```

| Сервис                                    | URL                                    |
|-------------------------------------------|----------------------------------------|
| Фронтенд                                  | http://localhost:3000                  |
| API                                       | http://localhost:3001                  |
| Swagger (документация API)                | http://localhost:3001/api/docs         |

## Скрипты (корень)

| Команда             | Действие                                             |
|---------------------|------------------------------------------------------|
| `npm run dev`       | Запуск dev-серверов (web + api)                      |
| `npm run build`     | Сборка всех пакетов                                  |
| `npm run lint`      | Линт всех воркспейсов                                |
| `npm run typecheck` | Проверка типов по всем воркспейсам                   |
| `npm run format`    | Форматирование Prettier                              |

Точечные команды: `npm run dev -w @tracker/api`, `npm run dev -w @tracker/web` и т. д.

## Основные эндпоинты API

Все эндпоинты, кроме `POST /auth/register` и `POST /auth/login`, требуют Bearer-токен (JWT). Ошибки валидации возвращают `400`, чужие/несуществующие записи — `404` (неразличимы намеренно).

### Auth (`/auth`) — публичные

| Метод | Путь           | Описание                          |
|-------|----------------|-----------------------------------|
| POST  | `/auth/register` | Регистрация, возвращает `{ accessToken, user }` |
| POST  | `/auth/login`    | Вход по email/паролю, `{ accessToken, user }` |
| GET   | `/auth/me`       | 🔒 Профиль текущего пользователя из JWT |

### Categories (`/categories`) — 🔒

| Метод  | Путь             | Описание                            |
|--------|------------------|-------------------------------------|
| GET    | `/categories`    | Список категорий (по `name` asc)     |
| POST   | `/categories`    | Создать категорию                   |
| GET    | `/categories/:id`| Категория по UUID                   |
| PATCH  | `/categories/:id`| Обновить категорию                  |
| DELETE | `/categories/:id`| Удалить категорию                   |

### Transactions (`/transactions`) — 🔒

| Метод  | Путь                 | Описание                                          |
|--------|----------------------|---------------------------------------------------|
| GET    | `/transactions`      | Пагинация + фильтры `dateFrom`, `dateTo`, `type`, `categoryId`, `page`, `limit` (по умолч. `page=1&limit=10`, макс. `limit=100`) |
| POST   | `/transactions`      | Создать транзакцию (`amount`, `type`, `date`, `categoryId`, `description?`) |
| GET    | `/transactions/summary` | Сводка за месяц (`month`/`year`): `{ totalIncome, totalExpense, balance }` |
| GET    | `/transactions/:id`  | Транзакция по UUID (с вложенной категорией)       |
| PATCH  | `/transactions/:id`  | Обновить транзакцию                               |
| DELETE | `/transactions/:id`  | Удалить транзакцию                                |

### Expenses (`/expenses`) — 🔒 (legacy)

Legacy-модуль, создан раньше `transactions`. Новый код ведётся через `transactions`, `expenses` поддерживается для обратной совместимости:

| Метод  | Путь             | Описание                          |
|--------|------------------|-----------------------------------|
| GET    | `/expenses`      | Список расходов (по `date` desc)   |
| POST   | `/expenses`      | Создать расход                    |
| GET    | `/expenses/:id`  | Расход по UUID                    |
| PATCH  | `/expenses/:id`  | Обновить расход                   |
| DELETE | `/expenses/:id`  | Удалить расход                    |

## Рабочий процесс и документация

- Правила git/git-flow, ветки, формат коммитов (Conventional Commits) — в [`CLAUDE.md`](CLAUDE.md).
- Специфика бэкенда (CQRS, Prisma, ownership-проверки) — [`apps/api/CLAUDE.md`](apps/api/CLAUDE.md).
- Специфика фронтенда (FSD-слои, роуты, паттерны) — [`apps/web/CLAUDE.md`](apps/web/CLAUDE.md).
- Правила code review — [`REVIEW.md`](REVIEW.md).
