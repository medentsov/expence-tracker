# apps/web — Фронтенд (Next.js)

Гайданс для работы внутри воркспейса `apps/web` (пакет `@tracker/web`). Общая информация о монорепозитории (стек, git flow, ветки, общие типы `@tracker/shared`) — в корневом `CLAUDE.md`. Здесь — специфика фронтенда.

## Команды

```bash
npm run dev -w @tracker/web      # next dev (порт 3000)
npm run build -w @tracker/web    # next build
npm run typecheck -w @tracker/web
npm run lint -w @tracker/web     # next lint (НЕ eslint напрямую)
npm run format -w @tracker/web   # prettier --write (наследует ../../.prettierrc)
npm run format:check -w @tracker/web
```

Форматирование настроено и в корне (`npm run format` → `turbo run format` по всем воркспейсам), и в самом воркспейсе. Конфиг — единый корневой `/.prettierrc`; скрипты воркспейсов явно указывают `--ignore-path ../../.prettierignore`, потому что Prettier не поднимает `.prettierignore` вверх по дереву (в отличие от `.prettierrc`).

## Конфигурация

- **`tsconfig.json`**: extends `../../tsconfig.base.json`; `module: esnext`, `moduleResolution: bundler`, `jsx: preserve`. Алиасы: `@/*` → `./src/*`, `@tracker/shared` → `../../packages/shared/src`.
- **`next.config.ts`**: единственная настройка — `transpilePackages: ['@tracker/shared']`.
- **`components.json`** (shadcn): `style: new-york`, `rsc: true`, `iconLibrary: lucide` (значение только для CLI; в рантайме иконки — inline SVG из `shared/ui/icon.tsx`). Aliases: `components/ui` → `@/shared/ui`, `utils` → `@/shared/lib/utils`, `hooks` → `@/shared/lib/hooks`. Tailwind v4 (`tailwind.config: ""`, тема в `src/app/globals.css` через `@theme`).
- **`postcss.config.mjs`**: только `@tailwindcss/postcss` (Tailwind v4).
- **`.env.example`**: `NEXT_PUBLIC_API_URL="http://localhost:3001"` — единственная переменная.
- **Линт**: своего `eslint.config.*` в `apps/web` нет. Web линтится встроенным `next lint`. Корневой `eslint.config.js` (ESLint 9, typescript-eslint) покрывает только `apps/api` и `packages/shared`, web туда **не входит**.

## Структура FSD-слоёв (`src/`)

```
app/        → роутинг/layouts/guards (Next App Router)
views/      → страницы (composition из features)
features/   → действия (формы, хуки, UI)
entities/   → домен (API-доступ к данным)
shared/     → инфраструктура (api, config, lib, ui)
```

Правило импортов — **только вниз**; кросс-импорты внутри слоя запрещены. Каждый слайс отдаёт публичный API через `index.ts`. Слой pages назван `views`, чтобы не конфликтовать с Pages Router.

## Роуты (`src/app/`)

- `/` → редирект по статусу сессии.
- `(auth)/` — публичные: `/login`, `/register` (guard: авторизован → `/dashboard`).
- `(protected)/` — приватные: `/dashboard`, `/transactions`, `/categories` (guard: нет токена → `/login`).
  `/transactions` — полный список операций с пагинацией и фильтрами (период, тип, категория);
  `/categories` — справочник категорий: просмотр, создание и редактирование.
- Статичные: `/privacy`, `/terms`.

`page.tsx` — тонкая обёртка над view-компонентом с `metadata`.

## `shared/`

- **`shared/api/client.ts`**: `apiFetch<T>(path, { method, body, token, signal })` — типизированный fetch. Класс `ApiError` (поля `status`, `payload`). Базовый URL — `API_URL` из `shared/config/env`. **Токен передаётся явно** аргументом — `shared` не знает про хранилище сессии. Сетевой сбой → `ApiError('Не удалось связаться с сервером', 0)`.
- **`shared/api/types.ts`**: `ApiErrorBody` (NestJS-формат), `extractMessage` (массив `message` join'ит `'; '`).
- **`shared/config/env.ts`**: `API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'`.
- **`shared/lib/utils.ts`**: реэкспорт `cn` и `ClassValue` из пакета `cn` (drop-in clsx+tailwind-merge от shadcn CLI 4.x). Единая точка для shadcn-компонентов: `@/shared/lib/utils`.
- **`shared/lib/format.ts`**: `formatMoney(amount)` — `Intl.NumberFormat('ru-RU', { currency: 'RUB' })`; `formatDate(iso)` — `ДД.ММ.ГГГГ`.
- **`shared/lib/date.ts`**: `todayInputDate()` — локальная дата `YYYY-MMDD` для `<input type="date">` (не UTC, как `toISOString().slice()`).
- **`shared/ui/`** — shadcn-компоненты: badge, button, card, checkbox, dialog, dropdown-menu, form, input, label, select, separator, sheet, skeleton, sonner. Добавляются `npx shadcn@latest add <name>` из `apps/web`.
  Плюс собственные примитивы дизайн-системы: `icon` (единственный источник inline-SVG иконок), `stat-card`, `ink-panel`, `empty-state`, `theme-provider`, `theme-toggle`.
  Все импортируют `cn` из `@/shared/lib/utils` (не из пакета `cn`).
  **Иконки — только inline SVG** через `Icon` (`shared/ui/icon.tsx`): ключ → массив path-строк, содержимое обёрнуто в `<g>`. Пакет `lucide-react` удалён.

## Дизайн-система

Токены — в `src/app/globals.css` (Tailwind v4, `@theme inline`, OKLCH):

- Визуальный язык — **dark-first premium**: глубокий синий/чёрный фон (`--background`), полупрозрачные поверхности и карточки с `backdrop-blur-xl`, тонкие рамки `border-white/10`. По умолчанию включена тёмная тема (`defaultTheme="dark"`).
- Шелл: `bg-background` с mesh-свечением на `body`; панель контента — `bg-surface/70 backdrop-blur-2xl` + `shadow-panel`.
- Главный акцент — `BalanceCard` (`features/transactions-summary`): индиго-пурпурный mesh-градиент, стеклянные вставки, реальные цифры сводки.
- Деньги: `text-positive` / `text-negative` — **не** `text-emerald-600` / `text-red-600`.
- KPI: `--tint-mint/sky/peach`; тёмная панель: `--ink-panel*`, компонент `InkPanel`.
- Кнопки: `rounded-full`, `hover:scale-105 active:scale-95 transition-all duration-300`, основная — `bg-primary` + `shadow-glow`.
- Шрифты: `font-display` (Manrope, заголовки/суммы), `font-sans` (Inter). Подключены в `app/layout.tsx` через `next/font/google`, **`subsets: ['latin','cyrillic']` обязателен**.
- Суммы всегда с `tabular-nums`, чтобы колонки не «плясали».
- Тема: `next-themes` (`attribute="class"`), `suppressHydrationWarning` на `<html>`, переключатель в топбаре.
- Иконки: `Icon` из `@/shared/ui/icon`, никаких icon-пакетов; для категорий — `iconForCategory(name)`.

**Шелл приватной зоны** — слайс `features/app-sidebar`: `AppSidebar` (десктоп, 256px, sticky), `MobileSidebar` (Sheet, < lg), `Topbar` (тема + профиль), `SidebarNav`/`SidebarLogo` (общие). Слайс `features/app-header` удалён.

## Паттерн feature-слайса

Эталон — `features/auth-login`:

```
index.ts                      # публичный API (обычно только UI-компонент)
api/<действие>.ts             # обёртка над entities/api или apiFetch
model/schema.ts               # zod-схема (правила зеркалят DTO бэкенда)
model/use-*.ts                # react-hook-form хук логики
ui/<Component>.tsx            # UI-компонент
```

Существующие features: `auth-login`, `auth-register`, `app-sidebar`, `transactions-summary` (`BalanceCard` с mesh-градиентом, `SummaryCards`, `MonthLedger`, строгая модель `WalletStats`; плитки «Доходы»/«Расходы» ведут на `/transactions?type=INCOME|EXPENSE`), `transactions-list` (хук принимает `TransactionsFilter` с `sortBy`/`sortOrder`; локальная строгая модель `Transaction` + адаптер `toTransaction`; таблица с сортируемыми заголовками `Наименование/Категория/Дата/Сумма`, строки `TransactionRow`, клик открывает редактирование; `TransactionsViewBar` — сегментированный переключатель типа `Все/Доходы/Расходы` + визуальная группировка по датам/категориям через `groupTransactions`), `transactions-filter` (панель фильтров без типа операции + `toApiFilter`), `transaction-create` (создание, редактирование и удаление: общие `TransactionFields`, `EditTransactionDialog`; реэкспортирует `useCategories`), `category-manage` (создание/редактирование/удаление категорий: `CategoryDialog` с палитрой и эмодзи).

Сортировка уходит в API (корректна на всех страницах), группировка — визуальная и применяется к уже загруженной странице (10 записей). Необратимые действия подтверждаются общим `shared/ui/confirm-dialog.tsx`.

## Паттерн entity-слайса

Эталон — `entities/session`:

```
index.ts                      # SessionProvider, useSession, getToken, типы
api/get-me.ts                 # тонкая обёртка над apiFetch
model/session-context.tsx     # контекст/провайдер
model/storage.ts              # localStorage (tracker.accessToken, tracker.user)
model/types.ts                # типы
```

`entities/transaction` (создание/обновление/удаление/список/сводка), `entities/category` (список, создание, обновление, удаление). **Токен передаётся аргументом** — entity-слой не импортирует `session` внутри себя (FSD: кросс-импорт внутри слоя запрещён).

## Сессия

- `useSession()` из `@/entities/session`: `{ user, status, signIn, signOut, ... }`. `user` — полный `User` из кэша `localStorage['tracker.user']` (после login/register); `GET /auth/me` отдаёт только JWT-payload (`{sub,email,name}`), не `User`.
- `getToken()` из `@/entities/session` — для авторизованных `apiFetch`-вызовов: `apiFetch(path, { token: getToken() ?? undefined })`.

## Соглашения

- Валидация форм — `react-hook-form` + `zod` (`@hookform/resolvers/zod`). Zod-схемы зеркалят DTO бэкенда (правила валидации).
- Импорты: `@/shared/...`, `@/entities/...`, `@/features/...`, `@/views/...`. Типы из `@tracker/shared` — `import type`.
- Тосты — `sonner` (`<Toaster />` в корневом layout).
