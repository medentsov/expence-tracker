import { dateToInputDate } from '@/shared/lib/date';
import { formatDate } from '@/shared/lib/format';
import type {
  Transaction,
  TransactionGroup,
  TransactionsGrouping,
} from './types';

// «Сегодня»/«Вчера» делают заголовки групп понятнее, чем повтор даты.
function dateGroupLabel(key: string): string {
  const today = dateToInputDate(new Date().toISOString());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = dateToInputDate(yesterdayDate.toISOString());

  if (key === today) return 'Сегодня';
  if (key === yesterday) return 'Вчера';
  return formatDate(`${key}T00:00:00`);
}

// Знаковая сумма группы: доходы «+», расходы «−».
function signedAmount(item: Transaction): number {
  return item.type === 'INCOME' ? item.amount : -item.amount;
}

// Группирует уже полученную страницу списка, сохраняя порядок элементов.
// Сортировка выполняется на бэкенде, поэтому группы идут в порядке,
// который задаёт выбранная сортировка.
export function groupTransactions(
  items: readonly Transaction[],
  grouping: TransactionsGrouping,
): TransactionGroup[] {
  if (grouping === 'none') return [];

  const groups = new Map<
    string,
    { key: string; label: string; color: string | null; items: Transaction[] }
  >();

  for (const item of items) {
    const key =
      grouping === 'date' ? dateToInputDate(item.date) : (item.category?.id ?? 'none');

    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        label:
          grouping === 'date'
            ? dateGroupLabel(key)
            : (item.category?.name ?? 'Без категории'),
        color: grouping === 'category' ? (item.category?.color ?? null) : null,
        items: [],
      };
      groups.set(key, group);
    }

    group.items.push(item);
  }

  return Array.from(groups.values(), (group) => ({
    ...group,
    total: group.items.reduce((sum, item) => sum + signedAmount(item), 0),
  }));
}
