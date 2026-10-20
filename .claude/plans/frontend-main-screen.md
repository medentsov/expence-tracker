# План: главный экран трекера расходов (фронтенд + пагинация)

## Context

После входа пользователь попадал на `/dashboard` — временную заглушку «Профиль» без навигации.
Нужен полноценный главный экран: меню с переходом к «Транзакциям» и «Категориям», отображение
имени пользователя, сводка за месяц и список последних транзакций с пагинацией по 10 записей.

Навигации по приватной зоне не было, а `GET /transactions` отдавал голый массив без пагинации —
поэтому изменения затронули три части репозитория: `apps/web`, `apps/api`, `packages/shared`.
Работа велась в ветке `feat/main-screen-frontend` (GitHub Flow).

## Решения (подтверждены пользователем)

1. **Пагинация серверная (offset)** — `GET /transactions?page&limit`, ответ `{ items, total, page, limit }`.
2. **Страницы «Транзакции» и «Категории»** — заглушки; наполнение отдельными фичами.
3. **Сводка за месяц** — включить на главный экран через существующий `GET /transactions/summary`.
4. **Шапка с меню и профилем** — в общем `(protected)` layout.

Валюта транзакций — `RUB` (у модели `Transaction` в Prisma нет поля `currency`).

---

## Чеклист реализации

### 0. Планирование и ветка
- [x] Разведка фронтенда (FSD-слои, session, `apiFetch`), бэкенда (CQRS, модуль transactions) и shared-типов
- [x] Уточнены развилки (пагинация, заглушки, сводка, место шапки)
- [x] Создана ветка `feat/main-screen-frontend`
- [x] Правила GitHub Flow зафиксированы в `CLAUDE.md`

### 1. Общие типы `packages/shared`
- [x] `src/types/pagination.ts` — `Paginated<T>` (`items`, `total`, `page`, `limit`)
- [x] Экспорт в `src/index.ts`

### 2. Бэкенд `apps/api` — пагинация транзакций
- [x] `GetTransactionsQueryDto`: `page` (`@Min(1)`) и `limit` (`1–100`, по умолчанию 10)
- [x] `GetTransactionsQuery`: поля `page`, `limit`
- [x] `TransactionsController.findAll`: проброс `page`/`limit`
- [x] `GetTransactionsHandler`: `skip`/`take` + `count` в `$transaction`, ответ `Paginated<Transaction>`
- [x] Приведение `Decimal → number` и `Date → ISO` для соответствия shared-типам

### 3. Фронтенд `apps/web` — инфраструктура
- [x] shadcn-компоненты: `dropdown-menu`, `badge`, `separator`, `skeleton`
- [x] `shared/lib/format.ts`: `formatMoney` (RUB), `formatDate`

### 4. Фронтенд — `entities`
- [x] `entities/transaction/api/list-transactions.ts` (`page`/`limit`)
- [x] `entities/transaction/api/get-summary.ts` (`month`/`year`)
- [x] `entities/transaction/api/create-transaction.ts` (`POST /transactions`)
- [x] `entities/category/api/list-categories.ts` (`GET /categories`)
- [x] Публичный API `entities/transaction/index.ts`, `entities/category/index.ts`

### 5. Фронтенд — `features`
- [x] `features/app-header` — меню (Главная/Транзакции/Категории), активный пункт через `usePathname`, профиль с именем и выходом
- [x] `features/transactions-summary` — карточки «Доходы», «Расходы», «Баланс» за текущий месяц
- [x] `features/transactions-list` — список по 10, скелетоны, пустое состояние, пагинация «Назад/Вперёд»
- [x] `features/transaction-create` — зелёная кнопка «Создать» (справа от заголовка «Главная»), модалка с формой (тип/сумма/категория/дата/описание), после создания обновляет список и сводку
- [x] Code review (уровень `high`) — исправлены все подтверждённые замечания:
  - [x] Локальная дата по умолчанию вместо UTC (`shared/lib/date.ts` + `todayInputDate`)
  - [x] Сброс формы и ошибки при закрытии диалога
  - [x] `refetch` вместо перемонтирования через `key` (без мерцания скелетонов)
  - [x] Фиксированный период сводки при монтировании
  - [x] Подрезка `page` при уменьшении числа страниц
  - [x] Ленивая загрузка категорий при открытии диалога
  - [x] Блокировка submit при отсутствии категорий
  - [x] `trailing newline` в новых файлах

### 6. Фронтенд — `views` и `app`
- [x] `views/dashboard` переписан: заголовок + кнопка «Создать», сводка + последние транзакции
- [x] `views/transactions`, `views/categories` — заглушки
- [x] `app/(protected)/layout.tsx` — общая шапка + контент `max-w-5xl`
- [x] Роуты `/transactions`, `/categories`; `metadata` дашборда → «Главная»

### 7. Проверка
- [x] `npm run typecheck` — 3/3 воркспейса
- [x] `npm run lint` — 3/3 воркспейса
- [x] `npm run build` — успешно, роуты собраны
- [x] E2E API: пользователь + категория + 12 транзакций → `page=1` вернул 10, `page=2` — 2, `total=12`
- [x] `amount` числом, даты ISO; сводка `{3000, 4800, -1800}`
- [x] Создание транзакции: `POST /transactions` → расход вырос 4800 → 5300
- [x] Роуты `/dashboard`, `/transactions`, `/categories` отвечают 200
- [ ] Визуальная проверка в браузере (в окружении нет браузера/playwright)

### 8. Документация и коммит
- [x] `CLAUDE.md`: контракт пагинации, новые слайсы, `Paginated<T>`
- [x] `.turbo/` добавлен в `.gitignore`
- [x] Коммиты в ветку `feat/main-screen-frontend` (`7fc12d8`, `a3927e1`, `68de511`)

---

## Что осталось / следующие шаги

- **PR в `main`** — следующий шаг по GitHub Flow; создаётся по запросу пользователя.
- **Визуальная проверка**: `npm run dev` → войти → проверить шапку, сводку, листание страниц, выход и модалку создания транзакции.
- **Наполнение `/transactions`**: полный список с фильтрами (`dateFrom`/`dateTo`/`type`/`categoryId` уже поддерживаются API).
- **Наполнение `/categories`**: CRUD категорий (бэкенд готов). Пока категорий нет, форма создания транзакции блокирует сохранение.
