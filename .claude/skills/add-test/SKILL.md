---
name: add-test
description: Добавление юнит-теста на файл, переданный аргументом. Определяет воркспейс (apps/api → Jest, apps/web и packages/shared → Vitest), анализирует роль файла и пишет co-located тест по соглашениям проекта. Вызывать по запросу «добавь тест», «напиши тест», «покрой тестом», «сделай тест», «add test».
argument-hint: [file-path]
allowed-tools:
    - Read
    - Write
    - Edit
    - Glob
    - Grep
    - Bash(npm *)
    - AskUserQuestion
---

# Добавление теста на файл

Пишет юнит-тест на переданный файл, не меняя сам файл (только создаёт/дополняет тест). Тестового фреймворка в проекте по умолчанию нет — скилл при необходимости поднимает минимальное окружение (см. «Подготовка окружения»).

## Аргументы

- `$0` — путь к тестируемому файлу (абсолютный или относительно корня репозитория).

Если путь не передан или файл не существует — уточнить через `AskUserQuestion`, не гадать.

## 1. Определить воркспейс и фреймворк

| Путь файла               | Воркспейс         | Фреймворк | Тест-раннер        |
| ------------------------ | ----------------- | --------- | ------------------ |
| `apps/api/src/**`        | `@tracker/api`    | Jest      | `ts-jest`          |
| `apps/web/src/**`        | `@tracker/web`    | Vitest    | `vite` (натив. TS) |
| `packages/shared/src/**` | `@tracker/shared` | Vitest    | `vite` (натив. TS) |

Файл вне `src/**` (конфиги, `.md`, `schema.prisma`) — обычным юнит-тестом не покрывается: сообщи это и предложи альтернативу (например, e2e/сценарий), не пиши тест вслепую.

## 2. Прочитать файл и понять его роль

Прочитай сам файл, а при необходимости — его соседей и импорты (`Grep`/`Read`), чтобы понять, **что именно** тестировать. Типовые случаи:

### apps/api (Jest + `@nestjs/testing` + `ts-jest`)

- **CQRS-обработчик** (`commands|queries/handlers/*.handler.ts`) — юнит на `execute()`: замокать `PrismaService` и шину (`QueryBus`/`EventBus`), проверить вызовы и возврат/выброс. (см. `create-transaction.handler.ts` — мокается `prisma.transaction.create` и `queryBus.execute`.)
- **Ownership-хелпер** (`*-ownership.ts`, `findOwned<Entity>`) — проверить: своя запись возвращается с вложенной категорией, чужая/отсутствующая → `NotFoundException` (404).
- **DTO** (`dto/*.dto.ts`) — опционально: `class-validator` через `validate()` (валидные проходят, невалидные собирают ошибки).

### apps/web и packages/shared (Vitest)

- **zod-схема** (`model/schema.ts`) — валидные/невалидные входы, `createEmptyValues()` (см. `transaction-create/model/schema.ts`).
- **api-обёртка** (`entities|features/*/api/*.ts`) — замокать `apiFetch` (или `@/shared/api/client`), сверить URL и параметры (см. `entities/transaction/api/list-transactions.ts`).
- **хранилище/модель с `localStorage`** (`model/storage.ts`) — запуск в `jsdom`, сброс `localStorage` в `beforeEach`, проверка `get/set/clear` и `JSON.parse`-fallback (см. `entities/session/model/storage.ts`).
- **чистые функции** (`shared/lib/*.ts`, `packages/shared` при наличии рантайм-кода) — обычный unit, без DOM (см. `shared/lib/date.ts`).
- **React-хуки** (`use-*.ts`) — `@testing-library/react` + `renderHook`; отдельно отметь, что это требует `jsdom` и `@testing-library/*`.
- **типы** (`packages/shared/src/types/*.ts`) — чисто compile-time, юнитом не тестируются; честно напиши это вместо пустого теста.

## 3. Выбрать имя и расположение теста

Тест кладётся **рядом с исходником** (co-located):

- `apps/api`: `<имя-файла>.spec.ts` (без расширения `.ts` исходника). Пример: `create-transaction.handler.ts` → `create-transaction.handler.spec.ts`.
- `apps/web` / `packages/shared`: `<имя-файла>.test.ts`.

Если тест уже существует — не перезаписывать, а **дополнять** недостающие кейсы.

## 4. Подготовка окружения (если не настроено)

> **Окружение уже настроено** (2026-10-23): зависимости, скрипты `test` и конфиги есть во всех трёх воркспейсах. Этот блок нужен только как fallback, если чего-то не хватает.

Проверить, есть ли тест-раннер и скрипт `test`:

```bash
grep -E '"(test|jest|vitest)"' apps/<api|web>/package.json
test -f apps/api/jest.config.js && echo "jest ok"
test -f apps/web/vitest.config.mts && echo "vitest ok"
```

Если нет — поднять окружение (рутинная операция, без запроса подтверждения). **Версии согласованы с проектом**: `@nestjs/testing@^10` (NestJS 10, не 12 — иначе peer-конфликт).

```bash
# API (Jest + ts-jest + @nestjs/testing@^10)
npm i -D -w @tracker/api jest ts-jest @types/jest "@nestjs/testing@^10.0.0"
# web (Vitest + jsdom + testing-library для DOM/hooks)
npm i -D -w @tracker/web vitest jsdom "@testing-library/react" "@testing-library/jest-dom"
# shared (Vitest)
npm i -D -w @tracker/shared vitest
```

Добавить скрипт `"test"` в `package.json` воркспейса (`jest` — api, `vitest run` — web/shared) и в корневой `"test": "turbo run test"`, плюс задачу `test` в `turbo.json`. Конфиги (эталон — уже существующие):

- `apps/api/jest.config.js` — `transform` на `ts-jest`, `testEnvironment: 'node'`, `testRegex: '\\.spec\\.ts$'`, `moduleNameMapper` для `@tracker/shared`.
- `apps/web/vitest.config.mts` — `environment: 'jsdom'`, alias `@` → `./src`, `@tracker/shared` → `../../packages/shared/src`, `setupFiles: ['./vitest.setup.ts']` (импорт `@testing-library/jest-dom/vitest`).
- `packages/shared/vitest.config.mts` — `environment: 'node'`.

> Конфиги Vitest — с расширением **`.mts`**, не `.ts`: в воркспейсах нет `"type": "module"`, иначе Vite грузит конфиг как CommonJS и ругается на ESM-синтаксис.

Прогон: из корня `npm run test` (turbo по всем воркспейсам) или точечно `npm run test -w @tracker/api|@tracker/web|@tracker/shared`.

### Эталонные smoke-тесты (как образцы)

- `apps/api/src/modules/transactions/transaction-ownership.spec.ts` — мок `PrismaService`, кейсы «своя запись» и «чужой → `NotFoundException`».
- `apps/web/src/shared/lib/date.test.ts` — чистая функция через alias `@/`.
- `packages/shared/src/types/currency.test.ts` — `CURRENCIES` (runtime-значение) в `node`-окружении.

## 5. Написание теста

Стиль — под существующий код: те же импорты, alias'ы (`@/`, `@tracker/shared`), русские комментарии по делу, без избыточных тестов. Тесты должны быть **детерминированными** (моки изолированы, `beforeEach` сбрасывает состояние), проверять поведение, а не реализацию.

## Правила

- **Не менять** сам тестируемый файл — только создавать/дополнять тест.
- **Не запускать** тесты без просьбы; после написания — предложить команду прогона.
- **Не трогать** `node_modules/`, `.next/`, `dist/` — они в `.gitignore`.
- Если роль файла не удалось однозначно определить — уточнить через `AskUserQuestion` (что именно покрыть), а не угадывать.
- Атрибуция коммита (если дойдёт до коммита) — по правилам `/commit-to-branch`: `Co-Authored-By: Claude Code <noreply@anthropic.com>`.
