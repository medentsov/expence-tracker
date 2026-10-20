# План: frontend логина и регистрации (shadcn/ui + Feature-Sliced Design)

## Context

API авторизации уже готов (`POST /auth/register`, `POST /auth/login`, `GET /auth/me`),
но во фронтенде `apps/web` нет ни UI-библиотеки, ни архитектурных слоёв: только
`app/layout.tsx`, `app/page.tsx`, `app/globals.css` и пустые `components/`/`lib/`.

Задача — реализовать страницы **входа** и **регистрации** на базе готового API,
используя UI-компоненты **shadcn/ui**, и закрепить во фронтенде архитектуру
**Feature-Sliced Design (FSD)**, отразив её в `CLAUDE.md`.

**Итог.** Пользователь регистрируется/входит через формы на shadcn/ui, попадает на
защищённую страницу `/dashboard` с данными профиля и может выйти. Код фронтенда
организован по слоям FSD, правило импортов «только вниз» соблюдается.

## Принятые решения (подтверждены пользователем)

1. **FSD через `src/`.** `app/` → `apps/web/src/app/`; слои FSD в `apps/web/src/`.
   Слой pages FSD называется **`views`** (не `pages` — чтобы не путать с Pages Router).
   Алиас `@/*` → `./src/*`.
2. **Сессия** — JWT в `localStorage` + React-контекст в `entities/session`,
   клиентский guard приватных роутов. Без изменений API.
3. **После входа** — защищённая страница `/dashboard` с данными профиля и кнопкой выхода.
4. **UI** — shadcn/ui на **Tailwind CSS v4**.

## Контракт API (не меняем)

| Метод | Путь | Тело / заголовок | Ответ |
|---|---|---|---|
| POST | `/auth/register` | `{ email, password(8..72), name? }` | 201 `{ accessToken, user }` |
| POST | `/auth/login` | `{ email, password }` | 200 `{ accessToken, user }` |
| GET | `/auth/me` | `Authorization: Bearer <token>` | 200 `{ sub, email, name? }` — **JWT-payload, не `User`** |

- `User` (`@tracker/shared`) = `{ id, email, name \| null, createdAt, updatedAt }`.
- Ошибки: `{ statusCode, message, error }`, где `message` — строка **или массив** строк
  (class-validator). Полный `User` приходит только в ответах login/register.

## Стек и версии (проверено в npm registry)

Next.js `15.5.27`, React `19.3.0` (уже установлены). Добавляем в `@tracker/web`:
`tailwindcss@4.3.3` + `@tailwindcss/postcss@4.3.3` (dev), `tw-animate-css@1.4.0`,
`class-variance-authority@0.7.1`, `clsx@2.1.1`, `tailwind-merge@3.7.0`, `lucide-react`,
`react-hook-form@7.90.0`, `zod@4.6.6`, `@hookform/resolvers@5.9.1`, `sonner@2.0.8`.
(`next-themes` не обязателен — тёмную тему в этой задаче не включаем, но `dark`-класс в теме предусмотрим.)

---

## Целевая структура `apps/web`

```
apps/web/
├── components.json            # конфиг shadcn (aliases → FSD-пути)
├── postcss.config.mjs         # @tailwindcss/postcss
├── .env.example               # NEXT_PUBLIC_API_URL (Next читает env из cwd = apps/web)
└── src/
    ├── app/                          # Next.js App Router (тонкий слой роутинга)
    │   ├── layout.tsx                # root: <SessionProvider>, <Toaster>
    │   ├── globals.css               # Tailwind v4 + тема shadcn
    │   ├── page.tsx                  # «/» → по состоянию сессии
    │   ├── (auth)/
    │   │   ├── layout.tsx            # центрирование; авторизован → /dashboard
    │   │   ├── login/page.tsx        # → views/login
    │   │   └── register/page.tsx     # → views/register
    │   └── (protected)/
    │       ├── layout.tsx            # клиентский guard: гость → /login
    │       └── dashboard/page.tsx    # → views/dashboard
    ├── views/                        # FSD pages-слой
    │   ├── login/ui/LoginPage.tsx
    │   ├── register/ui/RegisterPage.tsx
    │   └── dashboard/ui/DashboardPage.tsx
    ├── features/                     # пользовательские действия
    │   ├── auth-login/{model/use-login.ts, ui/LoginForm.tsx, index.ts}
    │   └── auth-register/{model/use-register.ts, ui/RegisterForm.tsx, index.ts}
    ├── entities/
    │   └── session/
    │       ├── model/{types.ts, storage.ts, session-context.tsx}
    │       ├── api/get-me.ts
    │       └── index.ts
    └── shared/
        ├── api/{client.ts, types.ts}     # apiFetch<T>, ApiError, разбор ошибок
        ├── config/env.ts                 # API_URL из NEXT_PUBLIC_API_URL
        ├── lib/utils.ts                  # cn()
        └── ui/                           # shadcn: button, input, label, card, form, sonner
```

**Правило импортов FSD:** `app → views → features → entities → shared` (только вниз,
кросс-импорты на одном слое запрещены). Каждый слайс отдаёт публичный API через `index.ts`.
Слой `widgets` в этой задаче не нужен — не создаём пустой слой.

---

## Шаги реализации

### 1. Перенос `app/` → `src/app/` и алиасы

- Переместить `apps/web/app/*` в `apps/web/src/app/`; удалить пустые `apps/web/components/`
  и `apps/web/lib/` (README-заглушки) — их заменяют `src/shared/*`.
- `apps/web/tsconfig.json`: добавить `"baseUrl": "."` и `"paths"`:
  `"@/*": ["./src/*"]` **и** `"@tracker/shared": ["../../packages/shared/src"]`
  (paths при `extends` не мержатся — задаём оба явно). `include`-glob `**/*.ts(x)` уже покрывает `src`.
- `next-env.d.ts` не редактируем (генерируется Next). Важно: **не оставлять оба `app/`** —
  иначе Next выберет корневой.

### 2. Tailwind v4 + shadcn/ui

1. Установка: `npm install -w @tracker/web tailwindcss @tailwindcss/postcss tw-animate-css class-variance-authority clsx tailwind-merge lucide-react react-hook-form zod @hookform/resolvers sonner`
2. `apps/web/postcss.config.mjs`: `export default { plugins: { '@tailwindcss/postcss': {} } };`
3. `apps/web/components.json` — style `new-york`, `rsc: true`, `tsx: true`, `iconLibrary: lucide`,
   `tailwind.css: "src/app/globals.css"`, `tailwind.config: ""` (v4 без конфига), aliases под FSD:
   `ui`/`components` → `@/shared/ui`, `utils` → `@/shared/lib/utils`, `lib` → `@/shared/lib`,
   `hooks` → `@/shared/lib/hooks`. Это заставит CLI класть компоненты в `src/shared/ui`, а не в `components/ui`.
4. `src/shared/lib/utils.ts` — `cn` (`clsx` + `tailwind-merge`).
5. `src/app/globals.css` — переписать под Tailwind v4: `@import "tailwindcss";`
   `@import "tw-animate-css";`, `@custom-variant dark (&:is(.dark *));`, блоки `:root`/`.dark`
   с CSS-переменными темы и `@theme inline { --color-*: var(--*) }`, `@layer base`.
   Удалить старые `--color-bg/--color-text` и глобальный `main { max-width… }` (конфликтует с центрированием).
6. `npx shadcn@latest add button input label card form sonner` из `apps/web` →
   компоненты в `src/shared/ui/`.

### 3. `shared` — API-клиент и конфиг

- `shared/config/env.ts`: `export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';`
- `shared/api/types.ts`: `ApiErrorBody { statusCode; message: string | string[]; error? }` +
  `extractMessage(body)` (массив → `join('; ')`).
- `shared/api/client.ts`: класс `ApiError extends Error` (поля `status`, `payload`) и
  `apiFetch<T>(path, { method, body, token })` — базовый URL, JSON-заголовки,
  `Authorization: Bearer` при наличии токена, разбор не-2xx в `ApiError`, `204 → undefined`,
  сетевые ошибки → `ApiError('Не удалось связаться с сервером', 0)`.
  Токен передаётся **аргументом** (не читается из localStorage внутри `shared`).

### 4. `entities/session` — состояние сессии

- `model/types.ts`: `SessionStatus = 'loading' | 'authenticated' | 'unauthenticated'`,
  `SessionContextValue { user: User | null; status; signIn(auth); signOut() }`.
- `model/storage.ts`: SSR-safe доступ к `localStorage` — ключи `tracker.accessToken` и
  `tracker.user` (кэш полного `User`), функции `getToken/setToken/clearToken` и `getUser/setUser/clearUser`.
- `api/get-me.ts`: `getMe(token)` → `GET /auth/me`; тип `MePayload = { sub; email; name? }` (не `User`).
- `model/session-context.tsx` (`'use client'`): `SessionProvider` + `useSession()`.
  - На монтировании: нет токена → `unauthenticated`; есть токен → `getMe` для валидации:
    успех → берём `User` из кэша (`tracker.user`), если кэша нет — восстанавливаем
    частичный `{ id: sub, email, name }`; `401` → `clearToken()` и `unauthenticated`.
  - `signIn(auth)` — сохраняет токен и `user`, стейт → `authenticated`.
  - `signOut()` — чистит storage, стейт → `unauthenticated` (навигацию делает вызывающий).
  - `index.ts` реэкспортирует `SessionProvider`, `useSession`, типы.
  > Тонкость: `me` отдаёт JWT-payload, а не `User`, поэтому полный `User` храним из login/register,
  > а `me` используем только для валидации токена при восстановлении.

### 5. `features/auth-login` и `features/auth-register`

Два отдельных слайса (разные действия, схемы и навигация), а не один `auth`.

- `model/use-login.ts` / `use-register.ts`: `useForm` + `zodResolver`, submit → вызов
  `login`/`register` (из `shared/api`), на успех `signIn(auth)` + `router.replace('/dashboard')`,
  на `ApiError` — `form.setError('root', { message })`.
- Схемы (в `model/`): login — email + непустой password; register — email, password 8..72,
  name ≤ 100 (зеркалят DTO бэкенда).
- `ui/LoginForm.tsx` / `RegisterForm.tsx`: shadcn `Form` + `Input`/`Label`, `Button` с
  состоянием загрузки, вывод ошибки API, ссылка на противоположную страницу.
- `index.ts` — публичный экспорт формы.

### 6. `views` — композиция страниц

- `views/login/ui/LoginPage.tsx`, `views/register/ui/RegisterPage.tsx` — `Card` с заголовком и формой.
- `views/dashboard/ui/DashboardPage.tsx` — данные из `useSession()` (`name`/`email`),
  кнопка «Выйти» (`signOut()` → `/login`), заглушка под будущие расходы.

### 7. Маршруты и guard'ы

- `src/app/layout.tsx`: обернуть `{children}` в `<SessionProvider>`, добавить `<Toaster />`.
- `(auth)/layout.tsx` (client): `status==='loading'` → спиннер; авторизован → `router.replace('/dashboard')`;
  иначе центрированный контейнер.
- `(protected)/layout.tsx` (client): `loading` → спиннер; `unauthenticated` → `router.replace('/login')`.
- `page.tsx`: клиентский редирект — авторизован → `/dashboard`, иначе → `/login`
  (состояние сессии известно только на клиенте, т.к. токен в localStorage).

### 8. Окружение и документация

- `apps/web/.env.example`: `NEXT_PUBLIC_API_URL=http://localhost:3001`
  (Next читает `.env*` из cwd = `apps/web`; корневой `.env.example` уже содержит эту переменную как справку).
- **`CLAUDE.md`**:
  - Новый раздел «Фронтенд — Feature-Sliced Design»: слои (`app`, `views`, `widgets`,
    `features`, `entities`, `shared`), назначение каждого, правило импортов «только вниз»,
    публичные API слайсов через `index.ts`, почему pages-слой назван `views`.
  - Алиас `@/*` → `src/*`; shadcn-компоненты в `src/shared/ui`, `cn` — в `src/shared/lib`;
    добавление компонентов `npx shadcn@latest add <name>` из `apps/web`.
  - Переписать существующий подраздел «Фронтенд» (сейчас: «components/ и lib/ пока пусты»).
  - Сессия: JWT в `localStorage` + контекст `entities/session`; `GET /auth/me` отдаёт JWT-payload, не `User`.
  - env: `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`), файл `apps/web/.env.example`.

---

## Текущее состояние (реализация и верификация завершены)

Весь код написан и проверен: `typecheck` (3/3), prod-сборка web, e2e API через curl
и smoke-проверка страниц web пройдены. Изменения **закоммичены** в `44f5602`
(`feat: авторизация, CQRS, frontend auth и модуль транзакций`).

**Осталось (необязательно, вне объёма задачи):**
- ручная браузерная проверка клиентских редиректов/localStorage (см. чеклист 9, пункт `[~]`);
- опционально: `eslint-plugin-boundaries` и починка `next lint` (deprecated).

### Отступления от плана (зафиксировано)
- API-вызовы login/register размещены в **своих фичах** (`features/auth-login/api/login.ts`,
  `features/auth-register/api/register.ts`), а не в `shared/api`. Это допустимо по FSD
  (фича владеет своим api-сегментом), транспорт остаётся в `shared/api`.
- **shadcn CLI установился версии `4.x`** (не legacy 2.x/3.x): сгенерировал компоненты в новом
  стиле — унифицированный пакет `radix-ui` (вместо `@radix-ui/react-*`) и пакет `cn`
  (drop-in замена `clsx`+`tailwind-merge`). Оба легитимны (официальные: `shadcn-ui/cn`,
  `radix-ui/primitives`). Поэтому:
  - в `dependencies` apps/web добавлены `cn` и `radix-ui`, `next-themes` (тянет `sonner`);
  - `shared/lib/utils.ts` теперь re-export `cn` из пакета `cn` (вместо ручного `clsx`+`tailwind-merge`);
  - сгенерированные компоненты переписаны на импорт `cn` из `@/shared/lib/utils` (единая точка).
  - `clsx`/`tailwind-merge` остались в deps (их тянет `class-variance-authority`, использует `button.tsx`).

---

## Чеклист реализации

### 0. Планирование
- [x] Разведка кодовой базы (API auth-модуль, shared-типы, конфиги web/root)
- [x] Уточнены развилки: FSD-структура, модель сессии, объём после входа (AskUserQuestion)
- [x] Проверены версии пакетов в npm registry и совместимость с Next 15 / React 19
- [x] План сохранён в `.claude/.plans/frontend-auth-fsd.md`

### 1. Перенос и алиасы
- [x] `apps/web/app/*` → `apps/web/src/app/` (корневой `app/` удалён)
- [x] Удалить пустые `apps/web/components/`, `apps/web/lib/`
- [x] `tsconfig.json`: `baseUrl` + `paths` (`@/*`, `@tracker/shared`)

### 2. Tailwind v4 + shadcn/ui
- [x] Установить зависимости в `@tracker/web` (Tailwind, RHF, zod, sonner, `cn`, `radix-ui`…)
- [x] `postcss.config.mjs`
- [x] `components.json` (aliases → FSD)
- [x] `src/shared/lib/utils.ts` (`cn` — re-export из пакета `cn`)
- [x] Переписать `src/app/globals.css` под Tailwind v4 (тема shadcn)
- [x] `npx shadcn@latest add button input label card form sonner` → `src/shared/ui/` (6 файлов)

### 3. `shared`
- [x] `shared/config/env.ts`
- [x] `shared/api/types.ts` (`ApiErrorBody`, `extractMessage`)
- [x] `shared/api/client.ts` (`ApiError`, `apiFetch`)

### 4. `entities/session`
- [x] `model/types.ts`
- [x] `model/storage.ts` (SSR-safe localStorage)
- [x] `api/get-me.ts` (`MePayload`)
- [x] `model/session-context.tsx` (`SessionProvider`, `useSession`)
- [x] `index.ts` (публичный API)

### 5. `features`
- [x] `auth-login`: `model/schema.ts`, `api/login.ts`, `model/use-login.ts`, `ui/LoginForm.tsx`, `index.ts`
- [x] `auth-register`: `model/schema.ts`, `api/register.ts`, `model/use-register.ts`, `ui/RegisterForm.tsx`, `index.ts`

### 6. `views`
- [x] `views/login/ui/LoginPage.tsx`
- [x] `views/register/ui/RegisterPage.tsx`
- [x] `views/dashboard/ui/DashboardPage.tsx`

### 7. Маршруты и guard'ы
- [x] `src/app/layout.tsx` (SessionProvider + Toaster)
- [x] `src/app/page.tsx` (редирект по сессии)
- [x] `(auth)/layout.tsx`, `(auth)/login/page.tsx`, `(auth)/register/page.tsx`
- [x] `(protected)/layout.tsx`, `(protected)/dashboard/page.tsx`

### 8. Окружение и документация
- [x] `apps/web/.env.example` (`NEXT_PUBLIC_API_URL`)
- [x] `CLAUDE.md`: переписан подраздел «Фронтенд» (FSD-слои, алиас, shadcn/ui, сессия, env)

### 9. Проверка (end-to-end)
- [x] `docker compose up -d db` + `npx prisma migrate status` (БД и миграции — up to date)
- [x] `npm run typecheck` — 3/3 воркспейса успешно (web/api/shared)
- [x] `npm run build -w @tracker/web` — prod-сборка успешно (7 маршрутов)
- [x] API через curl: регистрация (полный `User`) / login / `me` (JWT-payload `{id,email,name}`) / 401 неверный пароль / 409 дубль email / 400 валидация (массив `message`) / 401 без токена
- [x] Web: `GET /login`, `/register`, `/dashboard`, `/` → HTTP 200; в HTML есть форма (Email/Пароль/Вход/«Зарегистрироваться»)
- [x] Tailwind v4 CSS собран: в статике присутствуют `bg-primary`, `border-input`, `text-muted-foreground`
- [~] Сценарии с реальным браузером (клиентские редиректы, localStorage, визуальная отрисовка) — не гонялись (нет браузерного раннера); логика guard'ов/сессии покрыта серверным рендером и статическим анализом

### Осталось / вне объёма
- [x] Коммит изменений — `44f5602` (по запросу пользователя)
- [ ] Опционально: `eslint-plugin-boundaries` для проверки слоёв FSD
- [ ] Опционально: починка скрипта `lint` для web (`next lint` deprecated в Next 15.5)

## Риски и подводные камни

- **`next lint`**: в Next 15.5 deprecated и требует `eslint-config-next` (не установлен) — `npm run lint`
  для web может упасть. Правка скрипта — вне объёма; отмечу при проверке (вариант — `--dir src`).
- **Tailwind v4**: нет `tailwind.config.js`; тема в CSS через `@theme`; `components.json.tailwind.config = ""`.
- **React 19**: версии shadcn-стека проверены; `tw-animate-css` вместо несовместимого с v4 `tailwindcss-animate`.
- **`paths` в tsconfig** не мержатся при `extends` — задаём `@/*` и `@tracker/shared` явно.
- **CORS** разрешён только `http://localhost:3000` — web запускать на 3000.
- **`me` ≠ `User`** — полный профиль берём из ответа login/register и кэшируем; `me` — только валидация.
