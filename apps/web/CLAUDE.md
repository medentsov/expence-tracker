# apps/web — Фронтенд (Next.js)

Гайданс для работы внутри воркспейса `apps/web` (пакет `@tracker/web`). Общая информация о монорепозитории (стек, git flow, ветки, общие типы `@tracker/shared`) — в корневом `CLAUDE.md`. Здесь — специфика фронтенда.

## Команды

```bash
npm run dev -w @tracker/web      # next dev (порт 3000)
npm run build -w @tracker/web    # next build
npm run typecheck -w @tracker/web
npm run lint -w @tracker/web     # next lint (НЕ eslint напрямую)
```

Линта `format` в воркспейсе нет — форматирование только из корня (`npm run format`).

## Конфигурация

- **`tsconfig.json`**: extends `../../tsconfig.base.json`; `module: esnext`, `moduleResolution: bundler`, `jsx: preserve`. Алиасы: `@/*` → `./src/*`, `@tracker/shared` → `../../packages/shared/src`.
- **`next.config.ts`**: единственная настройка — `transpilePackages: ['@tracker/shared']`.
- **`components.json`** (shadcn): `style: new-york`, `rsc: true`, `iconLibrary: lucide`. Aliases: `components/ui` → `@/shared/ui`, `utils` → `@/shared/lib/utils`, `hooks` → `@/shared/lib/hooks`. Tailwind v4 (`tailwind.config: ""`, тема в `src/app/globals.css` через `@theme`).
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
- Статичные: `/privacy`, `/terms`.

`page.tsx` — тонкая обёртка над view-компонентом с `metadata`.

## `shared/`

- **`shared/api/client.ts`**: `apiFetch<T>(path, { method, body, token, signal })` — типизированный fetch. Класс `ApiError` (поля `status`, `payload`). Базовый URL — `API_URL` из `shared/config/env`. **Токен передаётся явно** аргументом — `shared` не знает про хранилище сессии. Сетевой сбой → `ApiError('Не удалось связаться с сервером', 0)`.
- **`shared/api/types.ts`**: `ApiErrorBody` (NestJS-формат), `extractMessage` (массив `message` join'ит `'; '`).
- **`shared/config/env.ts`**: `API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'`.
- **`shared/lib/utils.ts`**: реэкспорт `cn` и `ClassValue` из пакета `cn` (drop-in clsx+tailwind-merge от shadcn CLI 4.x). Единая точка для shadcn-компонентов: `@/shared/lib/utils`.
- **`shared/lib/format.ts`**: `formatMoney(amount)` — `Intl.NumberFormat('ru-RU', { currency: 'RUB' })`; `formatDate(iso)` — `ДД.ММ.ГГГГ`.
- **`shared/lib/date.ts`**: `todayInputDate()` — локальная дата `YYYY-MMDD` для `<input type="date">` (не UTC, как `toISOString().slice()`).
- **`shared/ui/`** — shadcn-компоненты (13 шт.): badge, button, card, checkbox, dialog, dropdown-menu, form, input, label, select, separator, skeleton, sonner. Добавляются `npx shadcn@latest add <name>` из `apps/web`.

## Паттерн feature-слайса

Эталон — `features/auth-login`:
```
index.ts                      # публичный API (обычно только UI-компонент)
api/<действие>.ts             # обёртка над entities/api или apiFetch
model/schema.ts               # zod-схема (правила зеркалят DTO бэкенда)
model/use-*.ts                # react-hook-form хук логики
ui/<Component>.tsx            # UI-компонент
```

Существующие features: `auth-login`, `auth-register`, `app-header`, `transactions-summary`, `transactions-list`, `transaction-create`.

## Паттерн entity-слайса

Эталон — `entities/session`:
```
index.ts                      # SessionProvider, useSession, getToken, типы
api/get-me.ts                 # тонкая обёртка над apiFetch
model/session-context.tsx     # контекст/провайдер
model/storage.ts              # localStorage (tracker.accessToken, tracker.user)
model/types.ts                # типы
```

`entities/transaction` (создание/список/сводка), `entities/category` (список). **Токен передаётся аргументом** — entity-слой не импортирует `session` внутри себя (FSD: кросс-импорт внутри слоя запрещён).

## Сессия

- `useSession()` из `@/entities/session`: `{ user, status, signIn, signOut, ... }`. `user` — полный `User` из кэша `localStorage['tracker.user']` (после login/register); `GET /auth/me` отдаёт только JWT-payload (`{sub,email,name}`), не `User`.
- `getToken()` из `@/entities/session` — для авторизованных `apiFetch`-вызовов: `apiFetch(path, { token: getToken() ?? undefined })`.

## Соглашения

- Валидация форм — `react-hook-form` + `zod` (`@hookform/resolvers/zod`). Zod-схемы зеркалят DTO бэкенда (правила валидации).
- Импорты: `@/shared/...`, `@/entities/...`, `@/features/...`, `@/views/...`. Типы из `@tracker/shared` — `import type`.
- Тосты — `sonner` (`<Toaster />` в корневом layout).
