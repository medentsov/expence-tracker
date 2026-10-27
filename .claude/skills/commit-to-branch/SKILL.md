---
name: commit-to-branch
description: Git-workflow трекера расходов — коммит в отдельную ветку и PR. Создание ветки от свежего main, атомарные коммиты по Conventional Commits с атрибуцией Co-Authored-By, создание Pull Request через gh pr create. Вызывать по запросу «закоммить», «сделай коммит», «commit», «добавь в ветку», «создай PR», «закоммить и создай PR».
allowed-tools:
    - Bash(git *)
    - Read
    - AskUserQuestion
    - Glob
    - Grep
---

# Git-workflow: коммит в ветку и Pull Request

Правила вынесены сюда из корневого `CLAUDE.md` (и согласованного с ним блока «Git и коммиты» в `REVIEW.md`).

## Базовые правила

1. **Коммитить только по явному запросу** пользователя. Не коммитить автоматически по завершении задачи — даже если задача выполнена и всё готово.
2. **Прямые коммиты в `main` запрещены.** Вся работа — в отдельной ветке; завершённая работа мержится в `main` через Pull Request, не напрямую.
3. **Одна ветка — одна фича.** В ветке — небольшие **атомарные** коммиты с Conventional Commits; не смешивать несвязанные изменения.

## Ветки

### `main` — всегда рабочая ветка

Код в `main` должен собираться (`npm run build`), проходить `npm run lint` и `npm run typecheck`. Прямые коммиты в `main` запрещены.

### Имя ветки `<type>/<краткое-описание-в-kebab-case>`

`<type>` — из Conventional Commits: `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/`. Примеры: `feat/main-screen-frontend`, `docs/readme-overhaul`.

**Ветку создаёт/переключает агент сразу при старте новой фичи**, до начала работы.

### Создание ветки — от свежего `main`

Перед созданием — переключиться на `main` и обновить его (`git pull`/`git fetch`):

```bash
git fetch origin
git checkout main
git merge --ff-only origin/main   # или git pull --ff-only
git checkout -b <type>/<краткое-описание-в-kebab-case>
```

Если ветка уже существует (вернулся к работе) — переключиться на неё: `git checkout <branch>`.

После мержа ветка удаляется; новая фича начинается с новой ветки от обновлённого `main`.

## Коммит

### 1. Проверить состояние

```bash
git status --short          # рабочее дерево: свои ли изменения лежат
git diff                    # просмотреть незастейдженные правки
git stash list              # не нужен ли чужой/случайный stash
```

Убедиться, что коммитим ровно то, что просил пользователь, а не чужие наработки. При смешанных изменениях уточнить состав коммита.

### 2. Застейджить и закоммитить

Атомарный коммит по задаче:

```bash
git add -A          # или точечно: git add <path>
git commit -m "<сообщение>"
```

Перед коммитом — `git diff --cached --stat`: в коммите не должно быть случайных файлов (`.env`, секретов, `dist/`, логов, `.turbo/`).

### 3. Формат сообщения (Conventional Commits)

```
<type>(<scope>): <описание>
```

- **Тип** — обязателен: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`.
- **Scope** — опционально, имя воркспейса: `api`, `web`, `shared`. Примеры: `feat(api): …`, `feat(web): …`. Допустим и формат без скопа: `docs: …`.
- **Описание** — на **русском**, краткое и по делу.

**Атрибуция** — каждое сообщение обязательно завершается строкой:

```
Co-Authored-By: Claude Code <noreply@anthropic.com>
```

Сообщение удобно передавать через `$(cat <<'EOF' … EOF)`:

```bash
git commit -m "$(cat <<'EOF'
feat(api): добавлен эндпоинт сводки за месяц

- расчёт totalIncome/totalExpense/balance через groupBy
- Swagger-декораторы и JSDoc

Co-Authored-By: Claude Code <noreply@anthropic.com>
EOF
)"
```

## Pull Request

**PR создаётся только по явному запросу** пользователя. Команда — `gh pr create`.

### Подготовка перед PR

- Ветка **перебазируется/мержится с актуальным `main`**.
- Проверки зелёные:
    ```bash
    npm run typecheck   # 3/3 воркспейса
    npm run lint        # 3/3 воркспейса
    npm run build       # успешно
    ```
- Ветка запушена: `git push -u origin <branch>`.

### Заголовок PR

По Conventional Commits, на русском, с scope: `feat(web): главный экран с пагинацией транзакций`.

### Тело PR

Включать:

- **Что реализовано** — инпойнты/экраны/эндпоинты.
- **Ключевые изменения по слоям** — shared/api/web.
- **Как проверить** — `npm run dev`, тестовые данные.
- **Что осталось / следующие шаги**.

Описание завершать строкой:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### После мержа

Ветка удаляется; новая фича начинается с новой ветки от обновлённого `main`.

## Чеклист

### Перед коммитом

- [ ] Пользователь явно запросил коммит.
- [ ] Ветка создана от свежего `main` и имеет имя `<type>/<kebab-case>` (не коммитим в `main`).
- [ ] В коммите только относящиеся к задаче файлы (`git status` / `git diff --cached`).
- [ ] Сообщение — Conventional Commits: `<type>(<scope>): <описание>`, тип из `feat/fix/chore/docs/refactor/test`, описание на русском.
- [ ] Сообщение завершено строкой `Co-Authored-By: Claude Code <noreply@anthropic.com>`.

### Перед PR

- [ ] Пользователь явно запросил PR.
- [ ] Ветка перебазирована/слита с актуальным `main`; запушена.
- [ ] `npm run typecheck`, `npm run lint`, `npm run build` — зелёные.
- [ ] Заголовок по Conventional Commits (тип + scope + описание, на русском).
- [ ] В теле: что реализовано, изменения по слоям, как проверить, что осталось.
- [ ] Описание завершено строкой `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
