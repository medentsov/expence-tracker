---
name: create-pr
description: Создание Pull Request на GitHub через gh pr create по заданным аргументам — название PR и имя ветки. Только PR: коммиты и ветки делает /commit-to-branch. Вызывать по запросу «создай PR», «открой PR», «сделай PR», «make PR», «pull request».
argument-hint: [pr-title] [branch-name, default main]
arguments: [pr_title, branch]
allowed-tools:
  - Bash(git *)
  - Bash(gh *)
  - Read
  - Glob
  - Grep
  - AskUserQuestion
---

# Создание Pull Request на GitHub

Скилл только **создаёт** PR через `gh pr create`. Он **не коммитит** и **не создаёт ветку** — это делает `/commit-to-branch`. Базовая ветка по умолчанию — `main`.

## Аргументы

- **`$pr_title`** — заголовок PR: по Conventional Commits, на русском, со scope. Если в заголовке есть пробелы — оборачивать в кавычки.
- **`$branch`** — имя ветки, которую открываем в PR.

Пример: `/create-pr "feat(web): главный экран с пагинацией" feat/main-screen-frontend`

Если какой-то из аргументов пустой или неразборчивый — уточнить через `AskUserQuestion` (заголовок и ветку по отдельности), не гадать.

## Шаги

1. **Проверить аргументы**: получить `title` (заголовок) и `branch` (ветку). Пустой `$branch` → взять текущую ветку: `git branch --show-current`.

2. **Проверить ветку:**
   - ветка существует локально:
     ```bash
     git branch --list <branch>
     ```
   - **ветка не равна `main`** — PR из `main` в `main` не создаётся (прямые коммиты в `main` запрещены). Если пользователь передал `main` — остановиться и уточнить реальную рабочую ветку через `AskUserQuestion`.
   - базовая ветка — `main`: `git branch --list main`.
   - **в ветке есть коммиты относительно `main`**:
     ```bash
     git log --oneline main..<branch>
     ```
     Пусто (включая случай, когда изменения ещё не закоммичены, — они видны в `git status` как untracked/modified) → **остановиться**: скилл не коммитит. Посоветовать сначала `/commit-to-branch`, затем повторить `/create-pr`.

3. **Проверить, запушена ли ветка в remote, и запушить при необходимости.** Это обязательный шаг: PR создаётся из remote-ветки, локальные коммиты без пуша в PR не попадут.

   ```bash
   # есть ли ветка на origin
   git ls-remote --heads origin <branch>
   ```

   - **Ветки нет в remote** → запушить её перед созданием PR:
     ```bash
     git push -u origin <branch>
     ```
   - **Ветка есть в remote, но локальная впереди** (есть незапушенные коммиты) → также запушить:
     ```bash
     git status -sb                     # проверить ahead/behind
     git push                           # или git push -u origin <branch>
     ```
   - **Ветка есть в remote и локально не впереди** → шаг пропустить.

   Запушить нужно именно перед `gh pr create`; после пуша убедиться, что remote содержит все коммиты (`git log --oneline origin/<branch>..<branch>` — пусто).

4. **Собрать материал для тела PR:**
   ```bash
   git log --oneline main..<branch>          # коммиты, которые войдут в PR
   git diff --stat main...<branch>           # изменённые файлы
   ```

5. **Составить тело PR** — из фактического диффа, не выдумывая. Секции:
   - **Что реализовано** — инпойнты/экраны/эндпоинты из коммитов и диффа.
   - **Ключевые изменения по слоям** — shared/api/web.
   - **Как проверить** — `npm run dev`, тестовые данные.
   - **Что осталось / следующие шаги**.

6. **Создать PR:**
   ```bash
   gh pr create --base main --head <branch> --title "<title>" --body "$(cat <<'EOF'
   <тело PR>

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```

7. **Вывести ссылку на PR** (вернёт `gh pr create`), не мержить автоматически.

## Чеклист

- [ ] Пользователь явно запросил PR.
- [ ] Ветка существует локально, не равна `main` (PR из `main` запрещён).
- [ ] В ветке есть коммиты относительно `main` (`git log main..<branch>` не пуст).
- [ ] Ветка запушена на `origin`; если её нет в remote или локальная впереди — сделан `git push` до `gh pr create`.
- [ ] Заголовок — Conventional Commits, на русском, со scope.
- [ ] Тело собрано из реального диффа (`git log main..<branch>`, `git diff main...<branch>`).
- [ ] Тело завершено строкой `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
