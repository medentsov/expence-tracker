# План: TransactionsModule — учёт доходов и расходов (бэкенд)

## Context

Промпт `.claude/prompts/transactions.md` требует создать `TransactionsModule` — центральный
модуль учёта доходов и расходов. Сейчас в проекте есть `User`, JWT-авторизация, модуль
`categories` (CRUD + поле `color`) и модуль `expenses`. Модуля транзакций нет — предстоит
создать его с нуля.

Задача — добавить модель `Transaction` в Prisma (с типом INCOME/EXPENSE), миграцию,
общие типы в `@tracker/shared` и CQRS-модуль с шестью эндпоинтами (CRUD + агрегация за месяц),
следуя эталонной структуре модуля `categories`.

**Итог:** пользователь может создавать/читать/менять/удалять свои транзакции и получать
сводку доходов/расходов за месяц. Данные строго изолированы по `userId`.

## Решения (подтверждены пользователем)

1. **Только бэкенд.** Фронтенд не трогаем.
2. **Поле `type` — Prisma-native enum** `TransactionType { INCOME, EXPENSE }` (как сказано в задаче).
3. **`GET /transactions/summary`** возвращает итоги за месяц:
   `{ month, year, totalIncome, totalExpense, balance }`.
4. **Владение категорией проверяем** при create/update — через `QueryBus` → `GetCategoryQuery`
   (модули общаются только через шины по правилу `CLAUDE.md`).

---

## Чеклист реализации

### 0. Планирование

- [x] Разведка (эталон categories/expenses, Prisma-схема, shared-типы)
- [x] Уточнены развилки (объём, enum, summary, владение категорией)
- [x] План сохранён

### 1. Prisma-схема и миграция

- [x] Enum `TransactionType { INCOME, EXPENSE }` в `schema.prisma`
- [x] Модель `Transaction` (все поля, `@@index`, обратные связи)
- [x] Миграция `20261014173918_add_transactions` создана и применена
- [x] `npx prisma generate` (Prisma Client v5.22.0 перегенерирован)

### 2. Общие типы `packages/shared`

- [x] `types/transaction.ts` (`Transaction`, `TransactionInput`, `TransactionsSummary`, `TransactionType`)
- [x] Экспорт в `index.ts`

### 3. Модуль `apps/api/src/modules/transactions/`

- [x] `module.ts` (контроллер + 6 хендлеров)
- [x] `controller.ts` (6 эндпоинтов, `@ApiBearerAuth`, `/summary` до `/:id`)
- [x] `transaction-ownership.ts`
- [x] DTO: `create`, `update`, `get-list-query`, `summary-query`
- [x] Команды: `create` (с проверкой категории), `update`, `delete`
- [x] Запросы: `get-list` (фильтры), `get-by-id`, `get-summary` (агрегация)

### 4. Регистрация в `app.module.ts`

- [x] Импорт `TransactionsModule` + добавить в `imports`

### 5. Проверка

- [x] `npm run typecheck` (3/3)
- [x] `npm run build -w @tracker/api`
- [x] E2E через curl: CRUD (201/200/404/401), summary (точные суммы), фильтры `type`, валидация enum/даты, владение категорией (404 на чужой categoryId)

> Примечание: в create/update хендлерах `date` конвертируется в `new Date(...)` — Prisma
> принимает строку только для полей, помеченных как `DateTime` с native-типом; иначе нужен `Date`.

### Осталось / вне объёма

- [x] Коммит — `44f5602` (по запросу пользователя)
- [x] Фронтенд — сделан в ветке `feat/main-screen-frontend`: сводка, список с пагинацией
      и форма создания транзакции (`7fc12d8`, `a3927e1`)

## Эталонные файлы

- `apps/api/src/modules/categories/` — эталон структуры CQRS-модуля
- `apps/api/src/modules/expenses/` — ближайший по смыслу (amount, categoryId, userId, index)
- `apps/api/prisma/schema.prisma` — существующие модели
