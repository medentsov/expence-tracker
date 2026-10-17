# План: JWT-авторизация и переход `apps/api` на CQRS

> Объединённый план двух последовательных итераций:
> **Этап 1** — JWT-авторизация (модули `users`/`auth`, защита роутов, фильтрация по владельцу).
> **Этап 2** — перевод межмодульного взаимодействия на `@nestjs/cqrs` (шины вместо прямых инъекций сервисов).

## Context

**Исходное состояние.** В проекте-трекере расходов авторизация — заглушка: `apps/api/src/modules/auth/` содержит только `GET /auth/status`, а модель `User` в Prisma есть, но без пароля. При этом у `Category` и `Expense` поля `userId` объявлены обязательными (`NOT NULL`), но сервисы их не передают — `POST /categories` и `POST /expenses` падают на уровне БД, а все данные глобальные.

**Этап 1.** Нужны модуль `users` с репозиторием и сервисом, модуль `auth` с JWT и методами `register`/`login`, защита роутов и фильтрация данных по владельцу. Итог — рабочий API, где пользователь регистрируется, логинится и работает только со своими категориями/расходами.

**Этап 2.** После этапа 1 модули связаны жёстко: `AuthModule` импортирует `UsersModule` и вызывает `UsersService` напрямую (вплоть до утечки Prisma-модели `PrismaUser` и обработки `P2002`). Переводим взаимодействие между модулями на шины `@nestjs/cqrs` (`CommandBus`/`QueryBus`/`EventBus`): контроллеры транслируют запросы в команды/запросы, а хендлеры живут в модуле-владельце данных и находятся глобально через `ExplorerService`. Итог — `AuthModule` перестаёт импортировать `UsersModule`; единый паттерн во всех модулях.

## Принятые решения

**Этап 1 (JWT):**
- **JWT:** `@nestjs/jwt` + собственный `JwtAuthGuard` (без passport).
- **Пароли:** `bcryptjs` (чистый JS, без node-gyp), cost 10. `bcryptjs@3.x` поставляет собственные типы — `@types/bcryptjs` **не нужен**.
- **Секрет:** `process.env.JWT_SECRET` через `JwtModule.registerAsync({ useFactory })` с fail-fast. `@nestjs/config` не подключаем — консистентно с текущим чтением `process.env.PORT`.
- **Срок токена:** `JWT_EXPIRES_IN`, дефолт `7d`.
- **Защита роутов:** глобальный `APP_GUARD` + `@Public()` для register/login; `@CurrentUser()` для доступа к пользователю.
- **Фаза 2 (categories/expenses)** — в ту же итерацию.
- **Миграция:** данных в `User` нет — очистим и добавим обязательный `passwordHash`.
- **Служебные поля:** дополнительно ничего, кроме `passwordHash` (`createdAt`/`updatedAt` уже есть).

**Этап 2 (CQRS):**
- **Объём:** полный CQRS по всем четырём модулям (`users`, `auth`, `categories`, `expenses`).
- **`AuthService`:** удаляется, контроллер инжектит `CommandBus`; подпись JWT — в новом тонком `TokenService`.
- **`GET /auth/me`:** остаётся как есть — возвращает `@CurrentUser()` из JWT (без обращения к БД). Отдельный `GetProfileQuery` **не создаём**.
- **События:** добавляем `UserRegisteredEvent` + handler-логгер (демонстрация `EventBus`). Саги не нужны.
- **Версия:** `@nestjs/cqrs@^10.2.8` — последняя, совместимая с NestJS 10 (peer `@nestjs/core ^9||^10`, `rxjs ^7`, `reflect-metadata ^0.2`; ветка 12.x требует Nest 12). `@nestjs/event-emitter` не нужен — встроенный `EventBus` покрывает внутрипроцессные события.
- **Слои:** `handler → UsersService → UserRepository` в `users` (сохраняем слои этапа 1, `toPublicUser` остаётся единственной точкой вычищения `passwordHash`). В `categories`/`expenses` репозитории **не заводим** — хендлер работает с глобальным `PrismaService` напрямую.
- **Валидация:** граница — DTO на контроллере (глобальный `ValidationPipe`). Команды/запросы — простые классы-контейнеры, без `class-validator`.

---

# ЭТАП 1 — JWT-авторизация

## 1.1. Общие типы — `packages/shared`

Новый файл `packages/shared/src/types/user.ts`:

```ts
export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
```

- Экспорт в `packages/shared/src/index.ts`: `export * from './types/user';`
- Обновить `packages/shared/src/types/README.md` (там уже написано, что типы пользователя «появятся»).
- `passwordHash` в shared **не попадает** — только публичный `User`.

## 1.2. Prisma: модель `User` + миграция

`apps/api/prisma/schema.prisma` — добавить обязательную колонку:

```prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  name         String?
  passwordHash String
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  categories Category[]
  expenses   Expense[]
}
```

- Перед миграцией очистить `User` (каскадом уйдут `Category`/`Expense`) — иначе NOT NULL-колонка не заполнится.
- `npx prisma migrate dev --name add_user_password_hash`, затем `npx prisma generate`.

## 1.3. Пакеты

```bash
npm install -w @tracker/api @nestjs/jwt@^10.2.0 bcryptjs@^3.0.3
```

`@nestjs/jwt@10.x` — peer `@nestjs/common ^8||^9||^10` (совместим с NestJS 10; `12.x` требует Nest 11).

## 1.4. Модуль `users` (с репозиторием)

Новая папка `apps/api/src/modules/users/`:

- **`users.repository.ts`** — слой доступа к данным, инкапсулирует Prisma:
  ```ts
  @Injectable()
  export class UserRepository {
    constructor(private readonly prisma: PrismaService) {}
    create(data: Prisma.UserCreateInput): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    existsByEmail(email: string): Promise<boolean>;
  }
  ```
  Тонкие обёртки над `this.prisma.user.*`. Сюда уходят все Prisma-вызовы по пользователю.
- **`users.service.ts`** — доменная обёртка над репозиторием:
  ```ts
  createUser(data: { email; passwordHash; name? }): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  toPublicUser(user: User): User;   // отбрасывает passwordHash — единственная точка «вычищения»
  ```
- **`users.module.ts`**: `providers: [UsersService, UserRepository]`, `exports: [UsersService]` (репозиторий наружу не отдаём). — *на этапе 2 `exports` будет убран, см. 2.3*.
- `UsersController` / `GET /users/me` не создаём — вместо него `GET /auth/me`.

## 1.5. Модуль `auth`

Расширить `apps/api/src/modules/auth/`:

- **`dto/register.dto.ts`** — `email: @IsEmail()`, `password: @IsString() @MinLength(8) @MaxLength(72)` (72 — лимит bcrypt), `name?: @IsOptional() @IsString() @MaxLength(100)`. Все поля с `@ApiProperty` и definite assignment assertion (`!`).
- **`dto/login.dto.ts`** — `email: @IsEmail()`, `password: @IsString() @IsNotEmpty()` (без `@MinLength`).
- **`dto/auth-response.dto.ts`** — Swagger-модель ответа (`accessToken: string`, `user: PublicUserDto`) для `/api/docs`.
- **`interfaces/jwt-payload.interface.ts`**:
  ```ts
  export interface JwtPayload { sub: string; email: string; name?: string; }
  export interface AuthenticatedUser { id: string; email: string; name?: string; }
  ```
- **`decorators/public.decorator.ts`** — `IS_PUBLIC_KEY = 'isPublic'`, `Public = () => SetMetadata(...)`.
- **`decorators/current-user.decorator.ts`** — `CurrentUser = createParamDecorator(...)` из `request.user`.
- **`guards/jwt-auth.guard.ts`** — `implements CanActivate`: через `Reflector` проверяет `IS_PUBLIC_KEY` (пропускает `@Public`), извлекает Bearer-токен, `jwtService.verifyAsync<JwtPayload>`, кладёт `req.user = { id: payload.sub, ... }`; при отсутствии/невалидности — `UnauthorizedException`.
- **`auth.service.ts`**:
  ```ts
  private static readonly BCRYPT_ROUNDS = 10;
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async register(dto): Promise<AuthResponse> {
    if (await this.usersService.findByEmail(dto.email))
      throw new ConflictException('Пользователь с таким email уже существует');
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.usersService.createUser({ ...dto, passwordHash });
    return this.buildAuthResponse(user);
  }

  async login(dto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash)))
      throw new UnauthorizedException('Неверный email или пароль');  // одинаковое сообщение — против enumeration
    return this.buildAuthResponse(user);
  }

  private async buildAuthResponse(user): Promise<AuthResponse> {
    const payload: JwtPayload = { sub: user.id, email: user.email, name: user.name ?? undefined };
    return { accessToken: await this.jwtService.signAsync(payload), user: this.usersService.toPublicUser(user) };
  }
  ```
  Дополнительно обернуть `create` в try/catch на Prisma `P2002` → `ConflictException` (гонка при регистрации).
  — *на этапе 2 файл удаляется, логика переезжает в `CreateUserHandler` + `RegisterHandler`/`LoginHandler`.*
- **`auth.controller.ts`**: удалить `GET /auth/status`; добавить
  - `@Public() @Post('register')` → 201, `@ApiCreatedResponse({ type: AuthResponseDto })`;
  - `@Public() @Post('login') @HttpCode(HttpStatus.OK)` → 200, `@ApiOkResponse({ type: AuthResponseDto })`;
  - `@Get('me') @ApiBearerAuth()` → возвращает `@CurrentUser()` (проверка guard'а).
- **`auth.module.ts`** (итоговый вид этапа 1):
  ```ts
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET не задан в окружении');
        return { secret, signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
  exports: [AuthService],
  ```

`main.ts` менять не нужно (`.addBearerAuth()` уже есть). `app.module.ts` — не нужно (`AuthModule` уже импортирован).

## 1.6. Переменные окружения

Добавить в `apps/api/.env.example` и `apps/api/.env`:
```
JWT_SECRET="dev-secret-change-me-in-production"
JWT_EXPIRES_IN="7d"
```
`.env` уже в `.gitignore`; секрет в код не зашивать.

## 1.7. Фаза 2: защита и фильтрация categories/expenses

Глобальный `APP_GUARD` автоматически закроет эти роуты. Чтобы они при этом **работали**, прокинуть `userId`:

- `categories.controller.ts` / `expenses.controller.ts`: добавить `@CurrentUser() user: AuthenticatedUser`, передавать `user.id` в сервис.
- `categories.service.ts` / `expenses.service.ts`: сигнатуры `create(dto, userId)`, `findAll(userId)`, `findOne(id, userId)`, `update(id, userId, dto)`, `remove(id, userId)`.
  - `findMany` → `where: { userId }`; `findUnique`/`update`/`delete` → `where: { id, userId }`; `create` → `data: { ..., userId }`.
  - Для `expenses` сохранить `include: { category: true }` и сортировку `date: 'desc'`.
- При несовпадении владельца `findOne` кидает `NotFoundException` (404, не 403) — не раскрываем существование чужой записи.
  — *на этапе 2 сервисы удаляются, эта же логика переносится в хендлеры.*

---

# ЭТАП 2 — переход на CQRS

## 2.1. Установка

```bash
npm install @nestjs/cqrs@^10.2.8 -w @tracker/api
```

## 2.2. Регистрация CqrsModule

`CqrsModule.forRoot()` в `AppModule` — регистрирует модуль глобально (`{ global: true }`) и экспортирует `CommandBus`/`QueryBus`/`EventBus`; feature-модули больше `CqrsModule` не импортируют.

`src/app.module.ts`:
```ts
imports: [CqrsModule.forRoot(), PrismaModule, UsersModule, CategoriesModule, ExpensesModule, AuthModule]
```
`UsersModule` теперь импортируется **явно** (раньше приходил транзитивно через `AuthModule`) — его провайдеры должны попасть в `ModulesContainer`, иначе `ExplorerService` не найдёт хендлеры.

Механика: `ExplorerService.explore()` сканирует `ModulesContainer` и по метаданным `@CommandHandler`/`@QueryHandler`/`@EventsHandler` собирает глобальный реестр в `onApplicationBootstrap()`. Поэтому вызывающему модулю не нужно импортировать модуль-владелец — достаточно, чтобы хендлер был провайдером любого модуля в графе.

## 2.3. Модуль `users` (владелец данных)

Новые файлы в `src/modules/users/`:

- `commands/create-user.command.ts` — `CreateUserCommand implements ICommand { email; passwordHash; name? }`.
- `commands/handlers/create-user.handler.ts` — `@CommandHandler(CreateUserCommand)`, `ICommandHandler<CreateUserCommand, User>`. Инжектит `UsersService` + `EventBus`. Сюда переезжает вся логика из `AuthService.register` (кроме хэширования): проверка `findByEmail` → `ConflictException`, `createUser`, ловля Prisma `P2002` → `ConflictException`, затем `eventBus.publish(new UserRegisteredEvent(...))`, возврат `usersService.toPublicUser(user)` (тип `User` из `@tracker/shared`).
- `queries/get-user-by-email.query.ts` — `GetUserByEmailQuery implements IQuery { email }`.
- `queries/handlers/get-user-by-email.handler.ts` — `@QueryHandler`, возвращает `UserCredentials | null`:
  ```ts
  // types/user-credentials.ts — не тащим Prisma-модель в auth
  export interface UserCredentials { id: string; email: string; name: string | null; passwordHash: string; createdAt: Date; updatedAt: Date; }
  ```
  `createdAt`/`updatedAt` включаем сразу, чтобы `LoginHandler` не делал второй запрос за публичным профилем.
- `events/user-registered.event.ts` — `UserRegisteredEvent implements IEvent { userId; email }`.
- `events/handlers/user-registered.handler.ts` — `@EventsHandler`, лог через `Logger`.

`users.module.ts` — регистрирует хендлеры, `exports` **убирается** (`UsersService`/`UserRepository` больше никто не инжектит):
```ts
@Module({
  providers: [UsersService, UserRepository, CreateUserHandler, GetUserByEmailHandler, UserRegisteredHandler],
})
export class UsersModule {}
```
`users.service.ts` и `users.repository.ts` — без изменений относительно этапа 1. `GetUserByIdQuery` не создаём — у него нет потребителя (YAGNI; добавим при появлении).

## 2.4. Модуль `auth` (потребитель)

Новые файлы в `src/modules/auth/`:

- `services/token.service.ts` — `@Injectable()`, инжектит `JwtService`, метод `sign(payload: JwtPayload): Promise<string>`.
- `commands/register.command.ts` — `RegisterCommand implements ICommand { email; password; name? }`.
- `commands/handlers/register.handler.ts` — `@CommandHandler`, `ICommandHandler<RegisterCommand, AuthResponse>`. Инжектит `CommandBus` + `TokenService`: `bcrypt.hash` (cost 10) → `commandBus.execute<CreateUserCommand, User>(new CreateUserCommand(email, hash, name))` → `tokenService.sign({ sub, email, name })` → `{ accessToken, user }`. Про Prisma/`P2002` не знает — `ConflictException` прилетает из `CreateUserHandler` через шину.
- `commands/login.command.ts` + `commands/handlers/login.handler.ts` — `@CommandHandler`, инжектит `QueryBus` + `TokenService`: `queryBus.execute<GetUserByEmailQuery, UserCredentials | null>` → `bcrypt.compare` → при неудаче `UnauthorizedException('Неверный email или пароль')` (одинаковое сообщение) → подпись токена и сборка `AuthResponse` из `UserCredentials`.

`auth.controller.ts` — конструктор `(private readonly commandBus: CommandBus)`. `register` → `commandBus.execute(new RegisterCommand(...))`; `login` → `commandBus.execute(new LoginCommand(...))`; `me` — **без изменений** (`@CurrentUser()` из JWT).

`auth.module.ts` — убрать `UsersModule` из `imports` (это и есть цель), убрать `AuthService`:
```ts
@Module({
  imports: [JwtModule.registerAsync({ /* без изменений */ })],
  controllers: [AuthController],
  providers: [TokenService, RegisterHandler, LoginHandler, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AuthModule {}
```
**Удалить:** `auth.service.ts`.

`JwtAuthGuard`, `@Public()`, `@CurrentUser()`, `dto/*`, `interfaces/*` — без изменений. `APP_GUARD` не конфликтует с CQRS: `ExplorerService` реагирует только на классы с метаданными хендлеров, guard их не имеет.

## 2.5. Модули `categories` и `expenses`

Механический перенос логики 1-в-1 из `*.service.ts` в хендлеры; хендлер работает с `PrismaService` напрямую.

Для `categories` (`src/modules/categories/`):
- `commands/{create,update,delete}-category.command.ts` — `CreateCategoryCommand(userId, name, icon?)`, `UpdateCategoryCommand(userId, id, name?, icon?)`, `DeleteCategoryCommand(userId, id)`.
- `commands/handlers/{create,update,delete}-category.handler.ts` — `create` → `prisma.category.create({ data: { ..., userId } })`; `update`/`delete` → сначала проверка владельца (`findUnique` + `userId` mismatch → `NotFoundException`), затем операция. Общий помощник — `category-ownership.ts` (`findOwnedCategory`).
- `queries/get-categories.query.ts` (`userId`) + handler → `findMany({ where: { userId }, orderBy: { name: 'asc' } })`.
- `queries/get-category.query.ts` (`userId, id`) + handler → `findUnique` + проверка владельца → `NotFoundException`.

Для `expenses` — аналогично, с сохранением `orderBy: { date: 'desc' }` и `include: { category: true }`; `create` пишет `{ ..., userId }`. Помощник — `expense-ownership.ts` (`findOwnedExpense`, тип `ExpenseWithCategory`).

`*.module.ts` → `controllers: [XController], providers: [<5 хендлеров>]`, `exports` убрать.
`*.controller.ts` → инжектит `CommandBus`/`QueryBus`, транслирует `@CurrentUser().id` + DTO в команды/запросы.

**Удалить:** `categories.service.ts`, `expenses.service.ts`.

---

## 3. Границы ответственности

| Ответственность | Где |
|---|---|
| Валидация входа (формат/whitelist) | Контроллер, DTO + глобальный `ValidationPipe` |
| Проверка владельца → 404 | Handler'ы `categories`/`expenses` (`userId` из `@CurrentUser()`) |
| Уникальность email + `P2002` → 409 | `CreateUserHandler` (users) |
| Неверные credentials → 401 | `LoginHandler` (auth) |
| Подпись JWT / верификация | `TokenService` / `JwtAuthGuard` |

## 4. Список файлов

### Этап 1

**Создать:**
- `apps/api/src/modules/users/users.module.ts`
- `apps/api/src/modules/users/users.service.ts`
- `apps/api/src/modules/users/users.repository.ts`
- `apps/api/src/modules/auth/dto/register.dto.ts`
- `apps/api/src/modules/auth/dto/login.dto.ts`
- `apps/api/src/modules/auth/dto/auth-response.dto.ts`
- `apps/api/src/modules/auth/decorators/public.decorator.ts`
- `apps/api/src/modules/auth/decorators/current-user.decorator.ts`
- `apps/api/src/modules/auth/guards/jwt-auth.guard.ts`
- `apps/api/src/modules/auth/interfaces/jwt-payload.interface.ts`
- `apps/api/src/types/express.d.ts` (аугментация `Request.user`)
- `packages/shared/src/types/user.ts`

**Изменить:**
- `apps/api/prisma/schema.prisma` (+`passwordHash`) → миграция `add_user_password_hash`
- `apps/api/src/modules/auth/auth.service.ts`, `auth.controller.ts`, `auth.module.ts`
- `apps/api/src/modules/categories/{categories.controller.ts,categories.service.ts}`
- `apps/api/src/modules/expenses/{expenses.controller.ts,expenses.service.ts}`
- `apps/api/package.json`, `apps/api/.env.example`, `apps/api/.env`
- `packages/shared/src/index.ts`, `packages/shared/src/types/README.md`

### Этап 2

**Создать:** команды/запросы/события и хендлеры в `users` (5 файлов + `types/user-credentials.ts`), `auth` (`TokenService` + 4 файла команд), `categories` (10 файлов + `category-ownership.ts`), `expenses` (10 файлов + `expense-ownership.ts`).

**Изменить:** `apps/api/package.json`, `package-lock.json`, `src/app.module.ts`, `src/modules/users/users.module.ts`, `src/modules/auth/{auth.module.ts,auth.controller.ts}`, `src/modules/categories/{categories.module.ts,categories.controller.ts}`, `src/modules/expenses/{expenses.module.ts,expenses.controller.ts}`.

**Удалить:** `src/modules/auth/auth.service.ts`, `src/modules/categories/categories.service.ts`, `src/modules/expenses/expenses.service.ts`.

**Без изменений:** `main.ts`, `prisma/*`, `dto/*`, `decorators/*`, `guards/*`, `interfaces/*`, `types/express.d.ts`, `packages/shared/*`, схема БД (в этапе 2 миграций нет).

> Побочная правка по ходу реализации: `apps/api/tsconfig.json` — добавлен `"noEmit": false` (в корневом `tsconfig.base.json` стоит `noEmit: true`, из-за чего `nest build` не выдавал JS; баг существовал до рефакторинга).

## 5. Порядок реализации

**Этап 1:**
1. `packages/shared`: `user.ts` + экспорт.
2. `schema.prisma` + миграция `add_user_password_hash` + `npx prisma generate`.
3. Установить пакеты (`@nestjs/jwt`, `bcryptjs`).
4. Модуль `users` (repository → service → module).
5. Модуль `auth` (DTO → service → controller → module → guard/decorators).
6. Env-переменные.
7. Фаза 2 (categories/expenses).
8. `npm run typecheck` и `npm run lint` из корня.

**Этап 2:**
9. `npm install @nestjs/cqrs@^10.2.8 -w @tracker/api`.
10. `app.module.ts`: `CqrsModule.forRoot()` + `UsersModule` в imports.
11. `users`: команды/запросы/событие + хендлеры, обновить модуль (убрать `exports`).
12. `auth`: `TokenService`, команды + хендлеры, переписать контроллер и модуль, удалить `auth.service.ts`.
13. `categories`: команды/запросы + хендлеры, контроллер/модуль, удалить сервис.
14. `expenses`: то же, удалить сервис.
15. `npm run typecheck -w @tracker/api` и `npm run build -w @tracker/api`.
16. Ручная проверка (ниже).
17. Обновить раздел «Архитектура» в `CLAUDE.md` (CQRS-паттерн).

## 6. Проверка (тестов в проекте нет — ручная)

```bash
docker compose up -d db
npm run dev -w @tracker/api   # порт 3001
```

**Авторизация и доступ (этап 1):**
- `POST http://localhost:3001/auth/register` body `{"email":"a@b.com","password":"secret123","name":"Test"}` → 201, `{accessToken, user}` без `passwordHash`.
- Повторный register тем же email → **409** (проверяет, что `ConflictException` летит из `CreateUserHandler` через шину).
- `POST /auth/login` с верным паролем → 200 + токен; с неверным → 401.
- `GET /auth/me` без заголовка → 401; с `Authorization: Bearer <token>` → 200 с профилем.
- `GET /categories`, `GET /expenses` без токена → 401; с токеном → только свои данные.
- `POST /categories` с токеном → 201 (проверяет, что `userId` прокинут и баг исправлен).
- Второй пользователь: `GET /categories` → `[]`; `GET/PATCH/DELETE` чужой категории/расхода → **404**.

**CQRS (этап 2):**
- CRUD категории и расхода с токеном → 201/200.
- Лог `UserRegisteredHandler` появляется при регистрации (проверка `EventBus`).
- Swagger `http://localhost:3001/api/docs` открывается, кнопка Authorize и схемы DTO на месте.

## 7. Вне объёма (отмечено, но не делаем)

- FK-нарушение `P2003` при `POST /expenses` с несуществующим `categoryId` сейчас даёт 500 — маппинг в 404/400 можно добавить отдельно.
- Репозитории для `categories`/`expenses`, саги, `GetUserByIdQuery` — по мере появления реальных потребителей.
- `npm run lint -w @tracker/api` не работает из-за отсутствия TS-конфига в корневом `eslint.config.js` (проблема существует до этого рефакторинга, не трогаем).
- Клиентская часть расчётов/графиков — только каркас страниц (`apps/web`).
