# apps/api — Бэкенд (NestJS)
Гайданс для работы внутри воркспейса `apps/api` (пакет `@tracker/api`). Общая информация о монорепозитории (стек, git flow, ветки, общие типы `@tracker/shared`) — в корневом `CLAUDE.md`. Здесь — специфика бэкенда.

## Команды
```bash
npm run dev -w @tracker/api            # nest start --watch (порт 3001)
npm run build -w @tracker/api          # nest build → dist/
npm run typecheck -w @tracker/api      # tsc --noEmit
npm run lint -w @tracker/api           # eslint "src/**/*.{ts,tsx}"

# Prisma (namespace-префикс prisma:*)
npm run prisma:generate -w @tracker/api
npm run prisma:migrate -w @tracker/api
npm run prisma:studio -w @tracker/api
```

## Конфигурация
- **`tsconfig.json`**: extends `../../tsconfig.base.json`; `module: commonjs`, `moduleResolution: node`, `target: ES2022`. `experimentalDecorators` + `emitDecoratorMetadata` (NestJS). Компилирует в `dist/` (`outDir: ./dist`, `noEmit: false`) — в отличие от web.
- **`.env.example`**: `DATABASE_URL`, `PORT=3001`, `JWT_SECRET`, `JWT_EXPIRES_IN="7d"`. Файл `apps/api/.env` — локальный, в git не попадает.
- **Линт**: своего `eslint.config.*` в `apps/api` нет. Линтится корневым flat-config `eslint.config.js` (ESLint 9, typescript-eslint), правило `files: ['apps/api/**/*.ts', 'packages/shared/**/*.ts']`, `tseslint.configs.recommended`.

## Bootstrap (`src/main.ts`)
- `NestFactory.create(AppModule)`.
- CORS: `origin: ['http://localhost:3000']`, `credentials: true` — только фронт. При развёртывании добавить домен.
- Глобальный `ValidationPipe`: `{ whitelist: true, forbidNonWhitelisted: true, transform: true }` — `transform` включён (query-параметры → числа).
- Swagger на `/api/docs` (`DocumentBuilder`, `addBearerAuth()`). URL: `http://localhost:3001/api/docs`.
- Порт: `Number(process.env.PORT) || 3001`.

## Модули (`src/modules/`)
Feature-модули: `auth`, `categories`, `expenses` (legacy), `transactions` (основной), `users`.

Типичный модуль данных (`categories`/`expenses`/`transactions`):
```
<name>.module.ts
<name>.controller.ts
<name>-ownership.ts        # ownership-хелпер (404 на чужую запись)
commands/                   # *.command.ts + handlers/*.handler.ts
queries/                    # *.query.ts + handlers/*.handler.ts
dto/                        # class-validator + Swagger-декораторы
events/                     # опционально (есть в users)
```

- **`auth`** — структура отличается: `decorators/` (`@CurrentUser()`, `@Public()`), `guards/` (`JwtAuthGuard`), `interfaces/` (`JwtPayload`, `AuthenticatedUser`), `services/` (`TokenService`).
- **`users`** — контроллера нет; только репозиторий + CQRS-хендлеры + события (`UserRegisteredEvent`). Наружу ничего не экспортирует — только хендлеры через шину.
- **`expenses`** — legacy-модуль (создан раньше `transactions`). Новый код вести через `transactions`.

## CQRS
`CqrsModule.forRoot()` в `AppModule` регистрирует `CommandBus`/`QueryBus`/`EventBus` глобально. Модули взаимодействуют **только через шины**, без прямых импортов друг друга. Контроллеры транслируют DTO в команды/запросы; хендлеры живут в модуле-владельце данных, находятся глобально через `ExplorerService`.

`AppModule` imports (порядок): `CqrsModule.forRoot()` → `PrismaModule` → `UsersModule` → `CategoriesModule` → `ExpensesModule` → `TransactionsModule` → `AuthModule`.

## Prisma
- **`src/prisma/`**: `PrismaModule` (`@Global`) + `PrismaService extends PrismaClient` (`$connect` в `onModuleInit`, `$disconnect` в `onModuleDestroy`). Подключается свободно, без явного импорта в feature-модулях.
- **`prisma/schema.prisma`**: модели `User` (с `passwordHash`), `Category`, `Expense`, `Transaction`. Денежные поля — `Decimal @db.Decimal(12, 2)`. UID-ключи (`@default(uuid())`). Связи User→сущности `onDelete: Cascade`, на Category `onDelete: Restrict`. Индексы `@@index([userId, date])` на Expense и Transaction.
- **Enum**: `TransactionType { INCOME, EXPENSE }`. У `Transaction` нет поля `currency` (в отличие от `Expense`).
- **Миграции** (`prisma/migrations/`): `20261008143648_init`, `20261008143648_add_user_password_hash`, `20261011155231_add_category_color`, `20261014173918_add_transactions`. После изменения `schema.prisma` — `npx prisma generate` и `npx prisma migrate dev`.

## Ownership-проверки (`*-ownership.ts`)
Файлы `category-ownership.ts`, `expense-ownership.ts`, `transaction-ownership.ts` лежат в корне соответствующего модуля (не в `handlers/`). Экспортируют `findOwned<Сущность>(prisma, userId, id)`:
- `findUnique({ where: { id } })`, если нет или `userId !== userId` → `throw new NotFoundException(...)`.
- Чужая запись не отличима от несуществующей (обе → 404), чтобы не раскрывать наличие чужих данных.
- `transaction-ownership.ts` также экспортирует тип `TransactionWithCategory = Prisma.TransactionGetPayload<{ include: { category: true } }>`.

## Auth
- JWT-авторизация: `POST /auth/register`, `POST /auth/login` (публичные, `@Public()`), `GET /auth/me` (данные из JWT, `{ id, email, name }`).
- Глобальный `JwtAuthGuard` (`APP_GUARD` в `AuthModule`) защищает все роуты; `@Public()` пропускает эндпоинт.
- Секрет/срок жизни — из `JWT_SECRET`/`JWT_EXPIRES_IN` (`.env`, `JwtModule.registerAsync` с fail-fast).
- Пароли — `bcryptjs` (cost 10). Подпись токена — `TokenService`.
- `@CurrentUser()` → `request.user` (`AuthenticatedUser` `{ id, email, name? }`). `id` — это `JwtPayload.sub`.

## Пагинация (`transactions`)
- `GET /transactions?dateFrom&dateTo&type&categoryId&sortBy&sortOrder&page&limit` — offset-пагинация. Ответ `Paginated<Transaction>` = `{ items, total, page, limit }`. По умолчанию `page=1&limit=10`, максимум `limit=100`.
- `sortBy` — `name|date|amount|category` (по умолчанию `date`), `sortOrder` — `asc|desc` (по умолчанию `desc`). `name` сортирует по `description` (пустые описания упорядочиваются по категории). Сортировка серверная: меняется порядок всех страниц, а не только текущей. Для стабильной пагинации к выбранному полю добавлены вторичные ключи (`date`, `id`).
- `amount` приводится `Decimal → number`, даты — ISO-строки (в хендлере явно `.toISOString()`), чтобы соответствовать shared-типам.
- `GET /transactions/summary?month&year` — сводка `{ totalIncome, totalExpense, balance }`.
- `DELETE /transactions/:id` — удаление своей транзакции (404 на чужую/несуществующую).
- `DELETE /categories/:id` — удаление категории; если в ней есть `Transaction`/`Expense` (связи `onDelete: Restrict`), возвращает **409 Conflict** с просьбой сначала перенести или удалить операции.

## DTO
- class-validator + class-transformer + Swagger-декораторы (`@ApiProperty`, `@ApiPropertyOptional`).
- `transform: true` в `ValidationPipe` → query-параметры конвертируются (`@Type(() => Number)`).
- `UpdateDto` — `PartialType(CreateDto)`.

## Соглашения
- Типы ответов API зеркалят интерфейсы из `@tracker/shared` (`packages/shared/src/types/`). Держать в синхронизации: при изменении DTO/ответа обновлять shared-типы.
- Скрипты API: `lint` = `eslint "src/**/*.{ts,tsx}""` (не `next lint`).

## Актуализация документации
После изменения любых методов, необходимо актуализировать или добавить JSDoc. А для dto и контроллеров добавить декораторы swagger.
