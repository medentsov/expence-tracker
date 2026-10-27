# Схема БД

Модель данных PostgreSQL трекера расходов. Источник истины — [`apps/api/prisma/schema.prisma`](../../apps/api/prisma/schema.prisma). Все `id` — UUID (`@default(uuid())`), денежные поля — `Decimal @db.Decimal(12, 2)`.

## Модели

### `User` — пользователь

| Поле           | Тип      | Ограничения            | Назначение                                                               |
| -------------- | -------- | ---------------------- | ------------------------------------------------------------------------ |
| `id`           | String   | `@id @default(uuid())` | UUID пользователя (это `JwtPayload.sub`)                                 |
| `email`        | String   | `@unique`              | Уникальный email — логин и ключ для сверки при входе                     |
| `name`         | String?  | nullable               | Отображаемое имя (необязательно)                                         |
| `passwordHash` | String   | —                      | Хэш пароля (bcrypt, cost 10). Пароль в открытом виде не хранится никогда |
| `createdAt`    | DateTime | `@default(now())`      | Дата создания                                                            |
| `updatedAt`    | DateTime | `@updatedAt`           | Дата последнего изменения                                                |

**Связи:** один ко многим → `Category`, `Expense`, `Transaction`.

**Цель полей:** `email` уникален, чтобы исключить дублирование учётных записей; `passwordHash` хранит только хэш — сырой пароль на сервере не появляется. `name` необязателен, чтобы регистрация требовала минимум данных (email + пароль). На `UNIQUE(email)` дополнительно опирается логика `CreateUserHandler`: гонка при параллельной регистрации ловится по ошибке Prisma `P2002`.

### `Category` — категория

| Поле        | Тип      | Ограничения                      | Назначение                                                                  |
| ----------- | -------- | -------------------------------- | --------------------------------------------------------------------------- |
| `id`        | String   | `@id @default(uuid())`           | UUID категории                                                              |
| `name`      | String   | —                                | Название (например, «Продукты»)                                             |
| `icon`      | String?  | nullable                         | Эмодзи-иконка для UI                                                        |
| `color`     | String?  | nullable                         | HEX-цвет — визуальная метка в UI (добавлено миграцией `add_category_color`) |
| `createdAt` | DateTime | `@default(now())`                | Дата создания                                                               |
| `updatedAt` | DateTime | `@updatedAt`                     | Дата изменения                                                              |
| `userId`    | String   | FK → `User`, `onDelete: Cascade` | Владелец категории                                                          |

**Связи:** принадлежит `User` (Cascade — при удалении пользователя удаляются его категории); один ко многим → `Expense`, `Transaction` (Restrict — категорию с записями удалить нельзя).

**Цель полей:** категория персонализирована (`userId`) — у каждого пользователя свой набор категорий; `icon`/`color` — чисто презентационные поля для UI, не участвуют в бизнес-логике.

### `Expense` — расход (legacy)

| Поле         | Тип      | Ограничения                           | Назначение                                                          |
| ------------ | -------- | ------------------------------------- | ------------------------------------------------------------------- |
| `id`         | String   | `@id @default(uuid())`                | UUID расхода                                                        |
| `amount`     | Decimal  | `@db.Decimal(12,2)`                   | Сумма (до 10 знаков до запятой и 2 после)                           |
| `currency`   | String   | `@default("RUB")`                     | Код валюты (ISO 4217) — отличается от `Transaction`, где валюты нет |
| `note`       | String?  | nullable                              | Комментарий/заметка                                                 |
| `date`       | DateTime | `@default(now())`                     | Дата расхода                                                        |
| `createdAt`  | DateTime | `@default(now())`                     | Дата создания                                                       |
| `updatedAt`  | DateTime | `@updatedAt`                          | Дата изменения                                                      |
| `userId`     | String   | FK → `User`, `onDelete: Cascade`      | Владелец                                                            |
| `categoryId` | String   | FK → `Category`, `onDelete: Restrict` | Категория расхода                                                   |

**Индекс:** `@@index([userId, date])` — ускоряет выборку расходов пользователя по дате.

**Цель полей:** `currency` хранит код валюты для мультивалютного учёта, `note` — произвольный пользовательский комментарий, `date` — дата, к которой относится расход (может отличаться от `createdAt`). `Restrict` на `categoryId` защищает от потери ссылки на категорию при попытке удаления.

### `enum TransactionType`

```prisma
enum TransactionType {
  INCOME
  EXPENSE
}
```

Различает доход (`INCOME`) и расход (`EXPENSE`). Используется только моделью `Transaction` (у `Expense` такого поля нет — расход по определению один тип).

### `Transaction` — транзакция (основной модуль)

| Поле          | Тип               | Ограничения                           | Назначение                                          |
| ------------- | ----------------- | ------------------------------------- | --------------------------------------------------- |
| `id`          | String            | `@id @default(uuid())`                | UUID транзакции                                     |
| `amount`      | Decimal           | `@db.Decimal(12,2)`                   | Сумма; на уровне DTO требуется > 0 (`@Min(0.01)`)   |
| `type`        | `TransactionType` | —                                     | `INCOME` или `EXPENSE`                              |
| `description` | String?           | nullable                              | Описание (до 500 символов на уровне DTO)            |
| `date`        | DateTime          | —                                     | Дата транзакции (обязательна — передаётся клиентом) |
| `createdAt`   | DateTime          | `@default(now())`                     | Дата создания записи                                |
| `updatedAt`   | DateTime          | `@updatedAt`                          | Дата изменения                                      |
| `userId`      | String            | FK → `User`, `onDelete: Cascade`      | Владелец                                            |
| `categoryId`  | String            | FK → `Category`, `onDelete: Restrict` | Категория                                           |

**Индекс:** `@@index([userId, date])` — ускоряет листинг транзакций по дате.

**Цель полей:** `type` кодирует направление (доход/расход), позволяя вычислять `totalIncome`/`totalExpense`/`balance` в сводке. **У `Transaction` нет поля `currency`** — по соглашению проекта единая валюта `RUB` (в отличие от legacy-`Expense`). `date` обязательна и хранит «день операции» для фильтров `dateFrom`/`dateTo` и группировки сводки за месяц.

---

## Связи (ER-диаграмма)

```
User 1 ────n Category 1 ────n Transaction
  │                │
  │                └──────n Expense
  └────────────────────────┘        (напрямую через userId)
```

- `User.category` ← `Category.userId` — **Cascade** (удаление пользователя каскадно удаляет категории).
- `User.expense` ← `Expense.userId` — **Cascade**.
- `User.transaction` ← `Transaction.userId` — **Cascade**.
- `Category.expense` ← `Expense.categoryId` — **Restrict** (нельзя удалить категорию, на которую есть ссылки).
- `Category.transaction` ← `Transaction.categoryId` — **Restrict**.

## Индексы

| Индекс                    | Модель        | Назначение                                                           |
| ------------------------- | ------------- | -------------------------------------------------------------------- |
| `@@index([userId, date])` | `Expense`     | Быстрая выборка расходов пользователя с сортировкой/фильтром по дате |
| `@@index([userId, date])` | `Transaction` | Быстрая выборка/пагинация транзакций и сводка за месяц               |
| `@unique` (email)         | `User`        | Уникальность учётной записи + гарантия целостности при регистрации   |

## Миграции

В `apps/api/prisma/migrations/` (в хронологическом порядке):

| Миграция                                | Что изменила                                           |
| --------------------------------------- | ------------------------------------------------------ |
| `20261008143648_init`                   | Начальная схема                                        |
| `20261011144024_add_user_password_hash` | Добавлен `User.passwordHash`                           |
| `20261011155231_add_category_color`     | Добавлены `Category.icon`/`color`                      |
| `20261014173918_add_transactions`       | Добавлен enum `TransactionType` и модель `Transaction` |

## Соглашения

1. **UID-ключи** — `String @default(uuid())`; внешние ссылки — по этим UUID.
2. **Деньги** — всегда `Decimal @db.Decimal(12, 2)`; в API/UI приводятся к `number`.
3. **Время** — `DateTime`; наружу сериализуется в ISO-строки. `createdAt`/`updatedAt` — служебные, `date` — бизнес-дата операции.
4. **Каскады** — осознанные: пользовательские данные принадлежат пользователю (Cascade), а записи ссылаются на категорию и не могут существовать без неё (Restrict).
5. **Единая валюта `RUB`** — в `Transaction` поле `currency` отсутствует намеренно; `Expense.currency` — наследие legacy-модели.

После изменения `schema.prisma`: `npx prisma generate` + `npx prisma migrate dev` (из `apps/api`).
