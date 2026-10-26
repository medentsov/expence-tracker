# Архитектура

Общее описание архитектуры трекера личных расходов. Дополняет корневой `CLAUDE.md` и воркспейс-гайды — здесь собрана «картина целиком»: как устроен монорепозиторий, как данные проходят от UI до БД и какие паттерны скрепляют слои.

## Обзор

Трекер — классическое трёхзвенное приложение в монорепозитории:

```
Next.js (apps/web)  ──REST/JSON──►  NestJS (apps/api)  ──Prisma──►  PostgreSQL (Docker)
        │                                   │
        └────────── @tracker/shared ────────┘   (общие типы/DTO)
```

- **`apps/web`** — фронтенд (Next.js App Router), пакет `@tracker/web`.
- **`apps/api`** — бэкенд (NestJS + CQRS), пакет `@tracker/api`.
- **`packages/shared`** — общие типы/DTO, пакет `@tracker/shared`. Единственный канал обмена контрактами между фронтом и бэком.

Монорепозиторий управляется npm workspaces; оркестрация сборочных задач — Turborepo (`turbo run ...`).

## Слои бэкенда (`apps/api`)

Бэкенд построен на **CQRS** (Command/Query/Event) поверх NestJS.

### Поток запроса

Контроллер не содержит бизнес-логики — он лишь транслирует DTO в команды/запросы и отдаёт результат хендлеров:

```
HTTP → Controller → ValidationPipe (DTO) → CommandBus/QueryBus → Handler → Prisma → PostgreSQL
```

### Ключевые механизмы

| Механизм | Где | Назначение |
|----------|-----|-----------|
| `CommandBus` | `CqrsModule.forRoot()` в `AppModule` | Команды-мутации (`Create*`, `Update*`, `Delete*`, `Login`, `Register`) |
| `QueryBus` | там же | Запросы-чтения (`Get*`, списки, сводка) |
| `EventBus` | там же | События-побочные эффекты (`UserRegisteredEvent`) |
| `PrismaModule` (`@Global`) | `src/prisma/` | Глобальный `PrismaService` — доступен любому хендлеру без явного импорта |
| `JwtAuthGuard` (`APP_GUARD`) | `auth` | Глобально защищает все роуты; `@Public()` пропускает эндпоинт |

Шины зарегистрированы глобально один раз в корне; модули общаются **только через шины**, без прямых импортов друг друга. Хендлеры находятся глобально через `ExplorerService`, поэтому модуль-владелец данных сам решает, как обрабатывать команду/запрос.

### Порядок импорта модулей (`AppModule`)

```
CqrsModule.forRoot() → PrismaModule → UsersModule → CategoriesModule → ExpensesModule → TransactionsModule → AuthModule
```

Порядок важен: сначала инфраструктура (шины, БД), затем владелец данных (`UsersModule`), затем доменные модули и **последним** `AuthModule`, который навешивает глобальный guard.

### Модули

| Модуль | Роль | Контроллер | Комментарий |
|--------|------|-----------|-------------|
| `users` | Владелец данных о пользователях | нет | Наружу ничего не экспортирует — взаимодействие только через шины. Единственная точка «вычищения» `passwordHash` |
| `auth` | Регистрация/вход, JWT | `AuthController` | Структура отличается: `decorators/`, `guards/`, `interfaces/`, `services/` |
| `categories` | CRUD категорий | `CategoriesController` | Образцовый CQRS-модуль данных |
| `transactions` | Доходы/расходы + сводка + пагинация | `TransactionsController` | Основной модуль учёта |
| `expenses` | Расходы (legacy) | `ExpensesController` | Создан раньше `transactions`; новый код вести через `transactions` |

### Типовая структура CQRS-модуля

```
<name>.module.ts
<name>.controller.ts
<name>-ownership.ts         # 404 на чужую/несуществующую запись
commands/                   # *.command.ts + handlers/*.handler.ts
queries/                    # *.query.ts + handlers/*.handler.ts
dto/                        # class-validator + Swagger-декораторы
events/                     # опционально (есть в users)
```

### Ownership-проверки

У каждой доменной сущности есть `findOwned<Сущность>(prisma, userId, id)`:

- `findUnique({ where: { id } })`, затем сравнение `entity.userId !== userId`.
- Чужая запись **не отличима** от несуществующей — обе бросают `NotFoundException` (404). Это намеренно, чтобы не раскрывать наличие чужих данных.

### Изоляция данных

Все доменные данные привязаны к `userId`. Идентификация — из `@CurrentUser()` (это `request.user`, положенный guard'ом из JWT). Хендлеры всегда фильтруют `where: { userId }`, чтобы пользователь видел только свои записи.

## Слой аутентификации

```
POST /auth/register  ──► RegisterHandler ──► CreateUserCommand (шина→users) ──► Prisma
       │                                        │
       │  bcrypt.hash(password, 10)             │  UserRegisteredEvent (EventBus)
       └────────────────────────────────────────┴──► TokenService.sign({ sub, email, name })
                                                        └──► { accessToken, user }
```

- Пароли — `bcryptjs` (cost 10).
- JWT подписывается `TokenService` (`JwtService.signAsync`), `JwtModule.registerAsync` — fail-fast: без `JWT_SECRET` приложение не стартует.
- `JwtAuthGuard` извлекает `Authorization: Bearer <token>`, верифицирует, кладёт `{ id, email, name }` в `request.user`.
- Одинаковое сообщение ошибки входа («Неверный email или пароль») для несуществующего пользователя и неверного пароля — против перебора.

## Слои фронтенда (`apps/web`)

Фронтенд следует **Feature-Sliced Design (FSD)**. Импорты — только «вниз», кросс-импорты внутри слоя запрещены. Каждый слайс отдаёт публичный API через `index.ts`.

```
app/        → роутинг/layouts/guards (App Router)
views/      → страницы (composition из features)
features/   → действия (формы, хуки, UI)
entities/   → домен (доступ к данным, сессия)
shared/     → инфраструктура (api, config, lib, ui)
```

Слой pages назван `views`, чтобы не конфликтовать с Pages Router.

### Визуальная система

Дизайн-токены живут в `apps/web/src/app/globals.css` (Tailwind v4, `@theme inline` + `:root`/`.dark` в OKLCH):

- **Шелл** — серый фон `--background`, белая «панель контента» `--surface` со скруглением `rounded-3xl`, сайдбар того же цвета, что и фон.
- **Семантика денег** — `--positive` / `--negative` вместо хардкода `emerald/red`.
- **Пастельные KPI** — `--tint-mint` / `--tint-sky` / `--tint-peach`; тёмная акцентная панель — `--ink-panel*`.
- **Типографика** — Manrope (`font-display`, заголовки и суммы) + Inter (`font-sans`, текст), подключены через `next/font/google` с `subsets: ['latin','cyrillic']`. Кириллица обязательна: у ряда латинских гротесков (напр. Plus Jakarta Sans) нет basic-cyrillic.
- **Тема** — `next-themes` (`attribute="class"`), переключатель `shared/ui/theme-toggle.tsx`; на `<html>` нужен `suppressHydrationWarning`.
- **Шелл приватной зоны** — `features/app-sidebar` (сайдбар + мобильный `Sheet` + топбар с профилем).

### Паттерн feature-слайса (эталон `auth-login`)

```
index.ts                  # публичный API (обычно только UI-компонент)
api/<действие>.ts         # обёртка над entities/api или apiFetch
model/schema.ts           # zod-схема (зеркалит DTO бэкенда)
model/use-*.ts            # react-hook-form хук логики
ui/<Component>.tsx        # UI-компонент
```

### Паттерн entity-слайса (эталон `session`)

```
index.ts                  # провайдер, хуки, getToken, типы
api/get-me.ts             # тонкая обёртка над apiFetch
model/session-context.tsx # контекст/провайдер
model/storage.ts          # localStorage (tracker.accessToken, tracker.user)
model/types.ts            # типы
```

Токен передаётся в `apiFetch` **явно аргументом** — `shared` и `entities` не знают про хранилище сессии (FSD: кросс-импорт внутри слоя запрещён).

## Общий код (`packages/shared`)

- Точка входа `src/index.ts`; типы в `src/types/`.
- Импортируется как `@tracker/shared` с обоих концов.
- Типы — интерфейсы, зеркалящие ответы API (и DTO бэкенда). Контракт держится в синхронизации: изменили DTO/ответ — обновили shared-тип.

### Соглашение о представлении данных

| Тип в Prisma | Тип в API/shared | Кто приводит |
|--------------|------------------|--------------|
| `Decimal(12,2)` | `number` | хендлер (`Number(row.amount)`) |
| `DateTime` | ISO-строка | хендлер (`.toISOString()`) либо сериализация |
| `passwordHash` | отсутствует в ответах | `UsersService.toPublicUser()` |

## Конфигурация и окружение

- `bootstrap()` в `src/main.ts`: CORS `origin: ['http://localhost:3000']`, `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`), Swagger на `/api/docs`, порт `PORT || 3001`.
- `transform: true` — query-параметры конвертируются в числа (`@Type(() => Number)`), что важно для `page`/`limit`/`month`/`year`.
- Фронтенд берёт базовый URL API из `NEXT_PUBLIC_API_URL` (иначе `http://localhost:3001`).

## Принципиальные решения и «почему так»

1. **CQRS поверх NestJS** — отделяет команды (мутации) от запросов (чтения), позволяет модулям развиваться независимо и общаться через шины без жёстких импортов.
2. **Модуль-владелец данных** (`users`) — единственная точка, где живёт Prisma-логика для `User` и «вычищение» `passwordHash`; наружу отдаётся явный тип `UserCredentials`, а не Prisma-модель.
3. **Ownership-проверки с «неразличимым 404»** — данные изолируются по `userId`, чужие записи не раскрываются.
4. **`expenses` — legacy** — модуль сохраняется для обратной совместимости, но новый код ведётся через `transactions` (у транзакции нет поля `currency`, единая валюта `RUB`).
5. **Единый контракт в `@tracker/shared`** — типы зеркалят DTO бэкенда и ответы API, чтобы фронт и бэк не расходились.
