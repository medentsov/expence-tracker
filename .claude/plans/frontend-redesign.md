# План: визуальный редизайн фронтенда («Wallet»-стиль)

## Context

Сейчас `apps/web` собран на дефолтной shadcn-теме: ахроматичная палитра (`neutral`, chroma 0),
шрифт не подключён вообще (системный стек), вся «жизнь» — из хардкод-утилит `emerald/red/blue/green`,
разбросанных по компонентам. Навигация — горизонтальная шапка `max-w-5xl`, экраны `/transactions`
и `/categories` — пустые заглушки в одну карточку.

Пользователь выбрал референс дашборда «Wallet» (мягкий светлый двухпанельный шелл, пастельные KPI-карточки,
тёмная акцентная панель, крупные скругления, минимум теней) и хочет перенести этот визуальный язык на весь
трекер расходов, **переверстав** приложение. Подтверждённые решения:

1. Охват — **весь фронтенд** (шелл, dashboard, transactions, categories, login/register).
2. **Светлая + тёмная** темы с переключателем.
3. Шрифты — **Manrope** (заголовки/цифры) + **Inter** (текст/таблицы) через `next/font/google`.
   Изначально планировался Plus Jakarta Sans, но проверка CSS из Google Fonts показала: у него есть
   только `cyrillic-ext` (U+0460–052F), а basic `cyrillic` (U+0400–045F) **отсутствует** — русские
   заголовки отрендерились бы fallback-шрифтом. Manrope кириллицу поддерживает.

Ограничение по содержанию: в API нет истории по месяцам, процентов «за неделю» и разбивки по категориям.
Поэтому **никаких фейковых спарклайнов и процентов** — только реальные данные:
`{totalIncome, totalExpense, balance}` за месяц, страница транзакций и справочник категорий.

Бэкенд не трогаем.

---

## Дизайн-система

### 1. Палитра

Цвета взяты пипеткой из референса (не «на глаз»), затем доведены до пригодной контрастности
для текста: в референсе неактивный текст `#B0AEB1` — это подписи/неактивная навигация,
а не основной контент.

| Роль | Светлая | Тёмная | Где |
|---|---|---|---|
| `--background` (шелл) | `#F6F4F4` | `#0E0D16` | фон приложения, сайдбар |
| `--surface` (панель) | `#FFFFFF` | `#17151F` | белая панель контента, карточки |
| `--card` | `#FFFFFF` | `#1B1926` | карточки внутри панели |
| `--foreground` | `#13111F` | `#F4F2F8` | заголовки, суммы |
| `--muted-foreground` | `#6F6B76` | `#A7A3B4` | вторичный текст, подписи |
| `--ink-soft` | `#B0AEB1` | `#6E6A7A` | неактивный пункт навигации |
| `--border` | `#ECE9EA` | `rgba(255,255,255,.08)` | разделители, рамки |
| `--input` (пилюля) | `#F6F6F6` | `#221F2E` | поля ввода, поиск-подобные элементы |
| `--secondary` | `#EDEDF0` | `#2A2738` | вторичная кнопка, hover |
| `--primary` | `#13111F` | `#F4F2F8` | главная кнопка |
| `--primary-foreground` | `#FFFFFF` | `#13111F` | текст на главной кнопке |
| `--positive` (доход) | `#1F7A4D` | `#5DD69B` | суммы доходов, дельта |
| `--negative` (расход) | `#B4472A` | `#FF9C7A` | суммы расходов |
| `--tint-mint` | `#EBFDF0` | `#16281F` | KPI «Доходы» |
| `--tint-sky` | `#E7EFFB` | `#17212F` | KPI «Баланс» |
| `--tint-peach` | `#FFEFE8` | `#2A1E1B` | KPI «Расходы» |
| `--ink-panel` | `#13111F` | `#211E2E` | тёмная акцентная панель |
| `--ink-panel-foreground` | `#F4F2F6` | `#F4F2F6` | текст на тёмной панели |
| `--ink-panel-muted` | `#9C98A8` | `#9C98A8` | подписи на тёмной панели |
| `--ink-panel-row` | `#423F46` | `#35313F` | выделенная строка в тёмной панели |

HEX — для наглядности; в `globals.css` записываем в **OKLCH** (как сейчас в проекте), пересчитав
через конвертер, чтобы сохранить единый формат файла.

Семантика вместо хардкода: `text-emerald-600` / `text-red-600` / `text-blue-600` / `bg-green-600`
по всему коду заменяются на `text-positive`, `text-negative`, `bg-primary`.

### 2. Типографика

Подключение в `src/app/layout.tsx`:

```
Manrope({ subsets: ['latin','cyrillic'], variable: '--font-display', weight: ['500','600','700'] })
Inter({ subsets: ['latin','cyrillic'], variable: '--font-sans' })
```

Не забыть **`cyrillic`** — интерфейс полностью русский, без него браузер подставит fallback.

| Токен | Шрифт | Размер / вес | Применение |
|---|---|---|---|
| `font-display` | Manrope | 28–32px / 700, tracking -0.02em | заголовки страниц |
| `font-display` | Manrope | 30–34px / 700, `tabular-nums` | суммы KPI |
| `font-display` | Manrope | 18–20px / 600 | заголовки карточек |
| `font-sans` | Inter | 14px / 400–500 | основной текст, строки списка |
| `font-sans` | Inter | 13px / 400 | подписи, метаданные |
| `font-sans` | Inter | 12px / 500, tracking 0.02em | бейджи, заголовки колонок |

`font-sans` — дефолт для `body`; `font-display` — только акценты. Все цифры денег —
с `tabular-nums`, чтобы колонки сумм не «плясали».

### 3. Формы, скругления, тени, отступы

- **Радиус**: `--radius: 0.875rem` (14px) → производные `sm 10 / md 12 / lg 16 / xl 20`;
  добавить `--radius-2xl: 1.5rem` (24px) для карточек, `--radius-3xl: 1.75rem` (28px) для панели контента.
  Кнопки и аватары — `rounded-full` (пилюля, как в референсе).
- **Тени — почти отсутствуют.** Одна мягкая: `--shadow-card: 0 1px 2px rgba(19,17,31,.04)`.
  Тёмная панель тени не имеет вообще — она держится на контрасте. Убрать `shadow-sm`/`shadow-xs`
  из `card`/`input`/`select` (в референсе их нет).
- **Отступы** (шкала 4px): внутри карточки — `p-5`/`p-6`; между карточками — `gap-4` (16) на мобиле,
  `gap-5` (20) на десктопе; между секциями — `gap-8` (32); панель контента — `p-6`/`p-8`;
  сайдбар — `px-5`.
- **Сетка контента**: `max-w-[1240px]`, 12-колоночная на десктопе, без «резинки на всю ширину».

### 4. Структура макета

```
┌────────────────────────────────────────────────────────────────────┐
│ shell: bg #F6F4F4, p-3                                          │
│ ┌──────────┬─────────────────────────────────────────────────┐   │
│ │ SIDEBAR  │  CONTENT PANEL (bg #FFF, rounded-3xl, p-8)      │   │
│ │ 248px    │ ┌─────────────────────────────────────────────┐ │   │
│ │          │ │ topbar: [пусто]        [☾ тема] [аватар ▾]  │ │   │
│ │ Логотип  │ ├─────────────────────────────────────────────┤ │   │
│ │          │ │  Заголовок страницы          [Создать]      │ │   │
│ │ ▸ Главная│ │                                             │ │   │
│ │   Транзак│ │  ┌────────┐ ┌────────┐ ┌────────┐           │ │   │
│ │   Категор│ │  │ Доходы │ │Расходы │ │ Баланс │  pastel   │ │   │
│ │          │ │  │  mint  │ │ peach  │ │  sky   │           │ │   │
│ │          │ │  └────────┘ └────────┘ └────────┘           │ │   │
│ │          │ │                                             │ │   │
│ │          │ │  ┌──────────────────────┐ ┌──────────────┐  │ │   │
│ │          │ │  │ Последние операции   │ │ DARK PANEL   │  │ │   │
│ │ ┌──────┐ │ │  │  ○ Продукты  −2 500  │ │ Итоги за окт.│  │ │   │
│ │ │CTA   │ │ │  │  ○ Зарплата +80 000  │ │ ─────────────│  │ │   │
│ │ │тёмный│ │ │  │  …                   │ │ Доходы +80k  │  │ │   │
│ │ │блок  │ │ │  │  ‹ 1 из 3 ›          │ │ Расходы −42k │  │ │   │
│ │ └──────┘ │ │  └──────────────────────┘ │ Остаток 38k  │  │ │   │
│ │          │ │                           │ [Добавить]   │  │ │   │
│ └──────────┴─────────────────────────────────────────────┘  │   │
└────────────────────────────────────────────────────────────────────┘
```

Ключевой приём референса: **белая панель лежит на сером шелле** (не наоборот), сайдбар — того же
серого, что и шелл (без рамки, без фона-«плиты»). Единственный «смелый» элемент — тёмная панель
`#13111F`; её немного.

Мобильный (< 1024px): сайдбар уезжает в `Sheet` (shadcn, на Radix Dialog — новой зависимости не нужно),
триггер — `Menu` в топбаре слева; панель контента теряет скругление и `p-3`, KPI-карточки идут
в одну колонку, тёмная панель — под списком.

---

## Реализация по шагам

Каждый шаг оставляет приложение собирающимся (`npm run typecheck -w @tracker/web`).

### Шаг 0. Ветка и сохранение плана
- Скопировать этот файл в `.claude/plans/frontend-redesign.md` (конвенция проекта).
- Ветка `feat/frontend-redesign` от свежего `main` (правила — skill `/commit-to-branch`).

### Шаг 1. Токены и шрифты
- `apps/web/src/app/globals.css` — переписать `:root` и `.dark` на палитру выше (OKLCH),
  добавить семантические токены, радиусы `2xl/3xl`, `--shadow-card`; маппинг в `@theme inline`
  (`--color-surface`, `--color-positive`, `--color-tint-mint/sky/peach`, `--color-ink-panel*`,
  `--font-display`, `--font-sans`).
- `apps/web/src/app/layout.tsx` — `next/font/google` (Manrope + Inter) с `subsets: ['latin','cyrillic']`,
  классы на `<html>`, `suppressHydrationWarning` + `next-themes` `ThemeProvider` (`attribute="class"`,
  `defaultTheme="system"`, `enableSystem`).
- Новый `shared/ui/theme-provider.tsx` + `shared/ui/theme-toggle.tsx` (переключатель
  light/dark/system, иконки `Sun`/`Moon`, `mounted`-guard от гидрации).

### Шаг 2. Базовые примитивы `shared/ui`
Правки только в уже существующих файлах, новые компоненты — по минимуму:
- `card.tsx` — `rounded-2xl border-border/70 bg-card p-6` без `shadow-sm`, убрать фиксированный `gap-6`.
- `button.tsx` — `rounded-full` по умолчанию, `variant: default` → `bg-primary`, `outline` → `bg-secondary border-transparent`.
- `input.tsx` / `select.tsx` — `rounded-xl bg-input border-transparent`, фокус через `ring-2 ring-ring/30`, без `shadow-xs`.
- `badge.tsx`, `skeleton.tsx`, `separator.tsx`, `dropdown-menu.tsx`, `dialog.tsx` — радиусы/цвета на токены,
  `dialog` — `rounded-3xl`, `shadow-2xl`.
- Заодно унифицировать импорт `cn` на `@/shared/lib/utils` (сейчас часть файлов импортирует из пакета `cn`).
- **Новые примитивы**: `shared/ui/stat-card.tsx` (пастельная KPI-карточка — переиспользуется на всех экранах),
  `shared/ui/ink-panel.tsx` (тёмная панель), `shared/ui/empty-state.tsx`.
- Добавить через CLI `npx shadcn@latest add sheet` (мобильное меню).

### Шаг 3. App shell
- Новый слайс `features/app-sidebar/` (`ui/AppSidebar.tsx`, `ui/MobileSidebar.tsx`, `index.ts`) —
  логотип, `NAV_ITEMS` (переносятся те же: `/dashboard`, `/transactions`, `/categories`), активный пункт
  как скруглённая пилюля на `bg-secondary`/`text-foreground`, неактивный — `text-ink-soft`;
  сохранить `aria-current="page"`, `aria-label="Основная навигация"`.
- Внизу сайдбара — тёмная карточка-CTA `#13111F` с кнопкой «Новая транзакция»
  (переиспользуется существующий `CreateTransactionButton`).
- `(protected)/layout.tsx` — новый шелл: `flex` из сайдбара и панели контента; контент —
  `rounded-3xl bg-surface p-6 lg:p-8`; топбар с `ThemeToggle` и профилем (аватар-инициал + dropdown
  с выходом переносятся из `AppHeader`).
- Старый `features/app-header` **удалить** после переноса (или оставить тонкой обёрткой, если
  удобнее — решить при реализации; дублировать навигацию нельзя).

### Шаг 4. Дашборд
- `views/dashboard/ui/DashboardPage.tsx` — заголовок «Обзор» + подпись с месяцем, справа `CreateTransactionButton`.
- `features/transactions-summary/ui/SummaryCards.tsx` → три `StatCard`: Доходы (`tint-mint`,
  иконка `TrendingUp` в чёрном скруглённом квадрате), Расходы (`tint-peach`, `TrendingDown`),
  Баланс (`tint-sky`, `Wallet`). Сумма — `font-display text-3xl tabular-nums`, подпись — месяц.
  Скелетоны и обработка ошибки сохраняются.
- Новый слайс `features/month-ledger/` (или блок внутри `transactions-summary`) — тёмная панель
  «Итоги за <месяц>»: строки Доходы/Расходы/Остаток + кнопка «Добавить». Данные — тот же `useSummary()`.
- `features/transactions-list/ui/TransactionItem.tsx` — строка без рамки: иконка категории в чёрном
  скруглённом квадрате (`size-9 rounded-xl bg-ink-panel text-ink-panel-foreground`, если `category.icon`
  нет — первая буква названия), название + дата, сумма справа (`text-positive`/`text-negative`,
  `tabular-nums`). Список — `divide-y divide-border`, карточка вокруг.
- `TransactionsList.tsx` — пагинация пилюлями, счётчик мелким текстом.
- Сетка: `grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]`.

### Шаг 5. Транзакции и категории
- `views/transactions/ui/TransactionsPage.tsx` — из заглушки в рабочий экран: заголовок + `CreateTransactionButton`,
  полноширинная карточка со списком (`TransactionsList` + `useTransactions`), пагинация, панель фильтров.
- `views/categories/ui/CategoriesPage.tsx` — сетка карточек категорий из `useCategories(true)`
  (ленивый хук уже есть): цветной квадрат `category.color`, название, пустое состояние.
  CRUD на фронте нет — только просмотр, без выдуманных кнопок.

### Шаг 5a. Фильтры списка транзакций (реализовано)

Бэкенд уже принимал `dateFrom`, `dateTo`, `type`, `categoryId` в `GetTransactionsQueryDto` —
фронт их не отправлял. Добавлено:

**Entity** (`entities/transaction`)
- `api/list-transactions.ts`: экспортируемый тип `TransactionsFilter` (те же 4 поля),
  `ListTransactionsParams extends TransactionsFilter`. Пустые значения в query не попадают.
- `index.ts`: реэкспорт `TransactionsFilter`.

**Feature** (новый слайс `features/transactions-filter`)
- `ui/TransactionsFilterBar.tsx` — кнопка «Фильтры» (`aria-expanded`) раскрывает панель
  `rounded-2xl bg-input` с четырьмя полями: «С даты» / «По дату» (`type="date"`, взаимные
  `min`/`max`), «Тип» (Все / доходы / расходы), «Категория» (селект из справочника).
  Счётчик активных фильтров на кнопке, кнопка «Сбросить», пресет «Текущий месяц».
- Значения-заглушки: `type: 'ALL'`, `categoryId: ''` — Radix `Select` не допускает пустую строку
  как значение, поэтому в API они конвертируются через `toApiFilter()` в `undefined`.
- `index.ts`: `TransactionsFilterBar`, `EMPTY_FILTER`, `countActiveFilters`, `toApiFilter`.

**Хук** (`features/transactions-list/model/use-transactions.ts`)
- Принимает `filter?: TransactionsFilter`, передаёт в `listTransactions`.
- Стабильный `filterKey` через `useMemo(JSON.stringify(...))` — новая ссылка на объект
  не вызывает лишних запросов; смена фильтра сбрасывает страницу на 1.

**Утилита** (`shared/lib/date.ts`) — `currentMonthRange()`: границы текущего месяца
в локальном времени (не UTC).

**Пустое состояние** — при активных фильтрах заголовок «Ничего не найдено»,
описание и ссылка «Сбросить фильтры» вместо CTA создания.

**Вне скоупа**: поиск по тексту описания — такого параметра в API нет, потребует правки бэкенда.

### Шаг 6. Auth
- `(auth)/layout.tsx` — шелл как в референсе: серый фон, по центру белая панель `rounded-3xl`;
  на десктопе — две колонки: слева тёмная брендовая панель «Трекер расходов» с коротким
  описанием, справа форма. На мобиле панель скрыта.
- `views/login`, `views/register` — заголовки на `font-display`, форма в `space-y-5`.
- `RegisterForm` — ссылки на `/terms` и `/privacy` с `text-blue-600` на токен `text-primary underline`.
- `privacy`/`terms` — обернуть в тот же визуальный язык (белая панель, типографика), разметку не менять.

---

### Шаг 7. Документация
- `apps/web/CLAUDE.md` — обновить раздел `shared/ui` (новые примитивы, `sheet`),
  добавить описание токенов/шрифтов и слайса `features/app-sidebar`, убрать упоминания `app-header`.
- `.claude/docs/architecture.md` (раздел «Слои фронтенда») — отразить шелл и новые слайсы.
- Скопировать финальный план в `.claude/plans/frontend-redesign.md`.

---

## Проверка

```bash
npm run typecheck -w @tracker/web
npm run lint -w @tracker/web          # next lint
npm run build -w @tracker/web
npm run test -w @tracker/web          # vitest (существующий date.test.ts)
```

Глазами (обязательно, оба режима):
1. `docker compose up -d db && npm run dev` → `http://localhost:3000`.
2. Войти тестовым пользователем → дашборд: KPI-карточки пастельные, суммы не «прыгают» при
   переключении страниц (`tabular-nums`), тёмная панель совпадает по цифрам с KPI
   (`income − expense === balance`).
3. Переключить тему — проверить все экраны: `/dashboard`, `/transactions`, `/categories`,
   `/login`, `/register`, `/privacy`. В тёмной теме нет нечитаемого текста и «белых пятен».
4. Сузить окно до 390px: сайдбар → `Sheet`, нет горизонтального скролла, KPI в одну колонку.
5. Клавиатурой: `Tab` по навигации и формам — видимый фокус-ринг; в сайдбаре активный пункт
   помечен `aria-current="page"`.
6. Создать транзакцию из CTA в сайдбаре и из дашборда — список и сводка обновляются.

## Риски

- **Гидрация**: `next-themes` требует `suppressHydrationWarning` на `<html>`, иначе предупреждение в консоли.
- **Кириллица**: без `subsets: ['cyrillic']` русский текст отрендерится fallback-шрифтом.
  Plus Jakarta Sans отброшен именно по этой причине — см. раздел «Типографика».
- **Каскад `card.tsx`**: правка базовых классов затронет диалоги/заглушки — пройти по всем экранам.
- **Контраст**: `#B0AEB1` годится только для неактивной навигации, не для текста; суммы — на `--positive`/`--negative`, не на пастели.
- **Удаление `AppHeader`** — проверить, что нигде не осталось импортов из `@/features/app-header`.
