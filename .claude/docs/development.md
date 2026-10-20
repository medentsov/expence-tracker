# Гайд для разработчиков

Практическое руководство по работе с кодовой базой: как запустить, как устроен типовой сценарий, как добавить новый код и какие правила соблюдать. Глубокие детали — в [`architecture.md`](architecture.md), [`api.md`](api.md), [`database.md`](database.md) и воркспейс-гайдах (`apps/api/CLAUDE.md`, `apps/web/CLAUDE.md`).

## Первый запуск

```bash
npm install                                   # 1. зависимости (из корня, workspaces)
cp .env.example .env                          # 2. корневой .env
cp apps/api/.env.example apps/api/.env        # 3. .env API (DATABASE_URL, JWT_SECRET; в git не попадает)
docker compose up -d db                       # 4. PostgreSQL (порт 5432)
npm run prisma:generate -w @tracker/api       # 5. Prisma Client
npm run prisma:migrate -w @tracker/api        # 6. применить миграции
npm run dev                                   # 7. web:3000 + api:3001
```

Проверить: фронт http://localhost:3000, API http://localhost:3001, Swagger http://localhost:3001/api/docs.

## Типовые команды

| Задача | Команда |
|--------|---------|
| Запустить всё | `npm run dev` |
| Только API / web | `npm run dev -w @tracker/api` / `npm run dev -w @tracker/web` |
| Сборка / линт / типы | `npm run build` / `npm run lint` / `npm run typecheck` |
| Форматирование | `npm run format` |
| Prisma generate/migrate/studio | `npm run prisma:* -w @tracker/api` |

> У скриптов разные тела: в API `lint` = `eslint "src/**/*.{ts,tsx}"`, в web `lint` = `next lint` (не eslint напрямую).

## Состояние системы и «что где»

- **БД запущена?** `docker compose ps`. Данные — в `./pgdata` (создаёт Docker, руками не трогать).
- **Схема изменилась?** `npx prisma generate` (клиент) + `npx prisma migrate dev` (миграция).
- **Посмотреть данные?** `npm run prisma:studio -w @tracker/api`.

## Типовой сценарий: добавить новую сущность/эндпоинт (бэкенд)

1. **Модель** — дополнить `apps/api/prisma/schema.prisma`, затем `generate` + `migrate dev`.
2. **Shared-тип** — добавить интерфейс в `packages/shared/src/types/`, экспортировать из `src/index.ts`. Тип должен **зеркалить** ответ API.
3. **Модуль** — создать CQRS-модуль по образцу `categories`:
   ```
   <name>.module.ts
   <name>.controller.ts
   <name>-ownership.ts          # findOwned<Сущность>(prisma, userId, id) → 404 на чужое
   commands/  # *.command.ts + handlers/*.handler.ts
   queries/   # *.query.ts + handlers/*.handler.ts
   dto/       # class-validator + Swagger-декораторы
   ```
4. **DTO** — входные/выходные классы с `@ApiProperty` и `class-validator`; для PATCH — `PartialType(CreateDto)`.
5. **Зарегистрировать магистраль** — добавить модуль в `imports` `AppModule` (порядок: после `UsersModule`, до `AuthModule`).
6. **Изоляция данных** — в хендлерах всегда `where: { userId }`; чужое → 404 через ownership-хелпер.
7. **Проверить** — `npm run typecheck && npm run lint`, сценарий через Swagger.

## Типовой сценарий: добавить действие во фронтенд (FSD)

1. **Entity** (доступ к данным) — обёртка над `apiFetch` в `entities/<сущность>/api/*.ts`.
2. **Feature** (действие/форма) — по образцу `auth-login`:
   ```
   index.ts                 # публичный API (UI-компонент)
   api/<действие>.ts        # обёртка над entities/api
   model/schema.ts          # zod-схема (зеркалит DTO бэкенда)
   model/use-*.ts           # react-hook-form хук
   ui/<Component>.tsx       # UI
   ```
3. **View** (страница) — тонкая обёртка над feature-композицией в `views/<name>/ui/<Name>Page.tsx`; `page.tsx` в `app/` — только `metadata` + view.
4. **Импорты** — только «вниз»; типы из `@tracker/shared` — `import type`. Публичный API слайса — через `index.ts`.
5. **Авторизация** — токен из `getToken()` передаётся явно в `apiFetch` (слой `shared`/`entities` не знает про хранилище).

## Ключевые паттерны, которые нельзя пропустить

### Авторизация и сессия

- Глобальный `JwtAuthGuard` защищает всё; `@Public()` — только для `register`/`login`.
- `@CurrentUser()` → `{ id, email, name? }` (из JWT). Для записей используйте `user.id`.
- `POST /auth/login` и `register` отдают `{ accessToken, user }`; `GET /auth/me` — **только** JWT-payload (`{ id, email, name? }`), без `createdAt`/`updatedAt`. Полный профиль для восстановления после перезагрузки фронт берёт из кэша `localStorage['tracker.user']`.

### Ownership и 404

Чужая запись всегда отдаёт `404` (а не 403) — так она не отличима от несуществующей. Используйте `findOwned<Сущность>` и всегда фильтруйте `where: { userId }`.

### Преобразование типов (БД → API)

| Prisma | Shared/API | Как |
|--------|------------|-----|
| `Decimal(12,2)` | `number` | `Number(row.amount)` |
| `DateTime` | ISO-строка | `.toISOString()` |
| `passwordHash` | — | `UsersService.toPublicUser()` |

### Единая валюта и legacy

- Валюта — `RUB` (поддержка `RUB | USD | EUR` в `CurrencyCode` для UI).
- Новый код учёта ведём через **`transactions`**, не `expenses`. У `Transaction` нет поля `currency`.

## Соглашения по коду

- **Формат коммитов** — Conventional Commits на русском: `feat(api): …`, `fix(web): …`, `docs: …`.
- **Ветки** — `<type>/<kebab-case>` от свежего `main`; прямые коммиты в `main` запрещены, мерж только через PR.
- **Документация** — после изменения методов актуализировать JSDoc; для DTO/контроллеров — Swagger-декораторы. При добавлении функционала проверять и актуализировать `.claude/docs/`.
- **Держать контракт в синхронизации** — изменили DTO/ответ бэкенда → обновили shared-тип и (при необходимости) zod-схемы во фронте.
- **Единая точка вычищения** — `passwordHash` убирается только в `UsersService.toPublicUser()`; не допускайте утечки Prisma-модели наружу (отдавайте явные типы, как `UserCredentials`).

## Диагностика типовых проблем

| Симптом | Причина / решение |
|---------|-------------------|
| API не поднялся на старте | Нет `JWT_SECRET` (`JwtModule.registerAsync` fail-fast) или БД недоступна. Проверьте `apps/api/.env` |
| `401 Требуется авторизация` | Не передан заголовок `Authorization: Bearer <token>` |
| `401 Недействительный токен` | Токен протух (`JWT_EXPIRES_IN`) или подписан другим `JWT_SECRET` |
| `404` при обращении к своей записи | Либо id не тот UUID, либо запись чужая (намеренно неразличимо) — сверьте `user.id` |
| `409` при регистрации | Email уже занят (или гонка регистрации — `P2002`) |
| `400` со списком в `message` | Ошибки валидации class-validator; смотрите перечисленные поля |
| CORS-ошибка на фронте | `origin` в `main.ts` разрешает только `http://localhost:3000` — добавьте свой домен |
| СЕТЕВАЯ ошибка `status 0` во фронте | API недоступен; `apiFetch` не разлогинивает пользователя при временном сбое |

## Когда что читать

- Почему так устроено — [`architecture.md`](architecture.md).
- Точные контракты эндпоинтов и валидация — [`api.md`](api.md).
- Назначение полей БД — [`database.md`](database.md).
- Специфика бэкенда (ньюансы Prisma/CQRS) — `apps/api/CLAUDE.md`.
- Специфика фронтенда (роуты, shadcn, паттерны) — `apps/web/CLAUDE.md`.
