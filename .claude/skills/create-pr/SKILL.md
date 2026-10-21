---
name: create-pr
description: Создание Pull Request на GitHub через gh pr create по заданным аргументам — название PR и имя ветки.
argument-hint: [title] [branch-name, default main]
allowed-tools:
  - Bash(git *)
  - Bash(gh *)
  - AskUserQuestion
---

# PR Skill

Создай Pull Request на GitHub, соблюдая соглашения проекта.

## Аргументы
- $0 — название PR
- $1 — целевая ветка

## Алгоритм выполнения

1. Выполни (`git branch --show-current`)

2. Убедись, что ветка запушена на remote:

```bash
git status -sb
```

- Если нет upstream — запушь: `git push -u origin $1`

3. Получи список коммитов от `main` до HEAD:

```bash
git log main..HEAD --oneline
```

4. Получи полный diff:

```bash
git diff main..HEAD --stat
```

5. На основе коммитов и diff составь тело PR:

    - **Summary**: 2–4 пункта — что реализовано/исправлено (суть, не файлы)

    - **Changes**: затронутые модули/эндпоинты (если есть)

    - **Test plan**: краткий чеклист шагов для проверки

6. Создай PR командой:

```bash
gh pr create --title "$0" --base main --head $1 --body "$(cat <<'EOF'
## Итог
- ...

## Изменения
- ...

## План тестирования
- [ ] ...

EOF
)"
```

## Правила

- Title если не передан строго по Conventional Commits: `type(scope): описание на русском`
- **Не мержи** PR автоматически
- **Не удаляй** ветку до явной просьбы пользователя
- Если PR для этой ветки уже существует — сообщи об этом и выведи ссылку на существующий PR (`gh pr view <branch>`)