# План: сущность «категория трат» — CRUD + поле `color`

## Context

Задача — реализовать сущность категории трат (идентификатор, имя, цвет, иконка, ID пользователя),
сервис с методами создания/поиска/обновления/удаления и защищённый контроллер с валидацией через
class-validator.

**Что выяснилось при разведке.** Модуль `apps/api/src/modules/categories/` уже был реализован в
рабочем дереве (не закоммичен) в стиле CQRS — как `expenses` и как зафиксировано в `CLAUDE.md`
(раздел «Архитектура»): 3 команды + 3 хендлера, 2 запроса + 2 хендлера, ownership-проверка
`findOwnedCategory` (404 на чужую запись), фильтрация по `userId`, DTO с class-validator и Swagger,
контроллер с `@CurrentUser()` под глобальным `JwtAuthGuard`. Модуль зарегистрирован в `AppModule`.

**Единственный реальный пробел** относительно формулировки задачи — отсутствовало поле **`color`**:
его не было ни в Prisma-схеме, ни в общих типах `@tracker/shared`, ни в DTO/командах.

## Принятые решения

- **Архитектура — оставить CQRS.** Упомянутый в задаче «сервис категорий» уже реализован как набор
  CQRS-хендлеров, работающих с `PrismaService` напрямую (консистентно с `expenses`). Отдельный
  `CategoriesService` не вводим.
- **`color` — опциональное поле формата HEX** (`#RRGGBB`), валидация `@IsHexColor`, в БД nullable
  (`String?`). Существующие категории не ломаются.

## Изменения

### Prisma
- `apps/api/prisma/schema.prisma` — модель `Category`: добавлено `color String?` (рядом с `icon`).
- Миграция `apps/api/prisma/migrations/20261011155231_add_category_color/migration.sql`
  (`ALTER TABLE "Category" ADD COLUMN "color" TEXT;`) + `npx prisma generate`.

### Общие типы `packages/shared`
- `packages/shared/src/types/category.ts` — `Category` получил `color?: string | null`,
  `CategoryInput` — `color?: string`.

### Бэкенд `apps/api/src/modules/categories`
- `dto/create-category.dto.ts` — добавлено поле `color` (`@ApiPropertyOptional` + `@IsOptional()`
  `@IsHexColor()`). `UpdateCategoryDto` наследует его через `PartialType(CreateCategoryDto)`.
- `commands/create-category.command.ts`, `commands/update-category.command.ts` — параметр `color?`.
- `commands/handlers/create-category.handler.ts`, `commands/handlers/update-category.handler.ts` —
  `color` в `data` для Prisma.
- `categories.controller.ts` — `dto.color` прокинут в `CreateCategoryCommand`/`UpdateCategoryCommand`.

## Что НЕ менялось (уже было готово)

- CRUD-эндпоинты `POST/GET/GET :id/PATCH :id/DELETE :id` под `@Controller('categories')`,
  защита глобальным `JwtAuthGuard` (`APP_GUARD` в `AuthModule`), `@ApiBearerAuth()`.
- Валидация через `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) в `main.ts`.
- Ownership: `findOwnedCategory(prisma, userId, id)` — чужая/несуществующая → 404.
- Хендлеры чтения (`get-categories`, `get-category`) и `delete` — возвращают модель `Category`
  целиком, `color` подхватывается автоматически.

---

## Чеклист реализации

### Подготовка схемы и типов
- [x] `schema.prisma`: добавить `color String?` в модель `Category`
- [x] Создать и применить миграцию `add_category_color`
- [x] `npx prisma generate` (Prisma Client перегенерирован)
- [x] `packages/shared/src/types/category.ts`: `color` в `Category` и `CategoryInput`

### Бэкенд
- [x] `dto/create-category.dto.ts`: поле `color` + `@IsHexColor`
- [x] `commands/create-category.command.ts`: параметр `color?`
- [x] `commands/update-category.command.ts`: параметр `color?`
- [x] `commands/handlers/create-category.handler.ts`: `color` в `data`
- [x] `commands/handlers/update-category.handler.ts`: `color` в `data`
- [x] `categories.controller.ts`: прокинуть `dto.color` в обе команды

### Проверка
- [x] `npm run typecheck` — 3/3 пакета успешно
- [x] `npm run lint` — 3/3 пакета успешно (после починки конфига, см. ниже)
- [x] `docker compose up -d db` + `npx prisma migrate dev`
- [x] Запуск `npm run dev -w @tracker/api` (порт 3001)
- [x] E2E через curl:
  - [x] `POST /categories {name,icon,color:"#FF5722"}` → 201, `color` в ответе
  - [x] `POST /categories` с `color:"not-a-color"` → 400 (валидация `@IsHexColor`)
  - [x] `GET /categories` → список с `color`
  - [x] `PATCH /categories/:id {color:"#00AA00"}` → 200, цвет обновлён
  - [x] `DELETE /categories/:id` → 200; повторный `GET :id` → 404
  - [x] чужая категория (токен другого пользователя) → 404
  - [x] без токена → 401
- [x] Остановить dev-сервер после проверки

### Осталось / вне объёма
- [ ] Коммит изменений (не делался — по правилам проекта только по запросу)

### Дополнительно выполнено (по ходу разбора «остатков»)
- [x] **Починен корневой `eslint.config.js`.** Причина: flat-config был `module.exports = { ignores }`
      без TS-парсера — ESLint 9 не находил конфигурацию для `.ts`, все файлы игнорировались и
      `eslint "src/**/*"` падал с exit code 2. Проверено через `git stash`: баг существовал до этих
      правок.
      - Установлен `typescript-eslint@^8.71.1` в корень (`npm install -D typescript-eslint`).
      - Конфиг переписан на `tseslint.config(...)`: глобальные `ignores` (глобы с `**/`) + блок
        `files: ['apps/api/**/*.ts', 'packages/shared/**/*.ts']` с `tseslint.configs.recommended`.
        `apps/web` линтуется своим `next lint` (не попадает под TS-блок).
      - По итогам первого прогона убрана устаревшая `// eslint-disable-next-line
        @typescript-eslint/no-namespace` в `apps/api/src/types/express.d.ts` (директива стала лишней →
        `reportUnusedDisableDirectives` ругался warning'ом).
      - Итог: `npm run lint` → 3/3 успешно, без ошибок и предупреждений.
- [x] **`AGENTS.md`** (managed-блок Turborepo, создаётся автоматически) добавлен в `.gitignore`.
- [x] Замечен побочный эффект `next lint`: изменил `apps/web/next-env.d.ts` (добавил
      `/// <reference path="./.next/types/routes.d.ts" />`). Файл помечен «should not be edited» и
      генерируется Next.js — к задаче отношения не имеет.
