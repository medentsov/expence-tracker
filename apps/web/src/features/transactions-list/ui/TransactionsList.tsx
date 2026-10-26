'use client';

import { Fragment } from 'react';
import type { Paginated, Transaction as ApiTransaction } from '@tracker/shared';
import { formatMoney } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { Icon } from '@/shared/ui/icon';
import { Skeleton } from '@/shared/ui/skeleton';
import { groupTransactions } from '../model/group-transactions';
import {
  toTransaction,
  type Transaction,
  type TransactionGroup,
  type TransactionsGrouping,
  type TransactionsSort,
  type TransactionsSortField,
} from '../model/types';
import { TransactionRow } from './TransactionRow';

interface TransactionsListProps {
  data: Paginated<ApiTransaction> | null;
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
  setPage: (page: number) => void;
  /** Подпись пустого состояния — на разных экранах разный контекст. */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  /** Клик по строке — открыть редактирование операции. */
  onSelect?: (transaction: Transaction) => void;
  /** Визуальная группировка загруженной страницы. */
  grouping?: TransactionsGrouping;
  /** Текущая сортировка и её изменение (клик по заголовку столбца). */
  sort?: TransactionsSort;
  onSortChange?: (sort: TransactionsSort) => void;
}

interface Column {
  field: TransactionsSortField;
  label: string;
  align?: 'right';
  /** На узких экранах столбец скрыт — данные уходят под наименование. */
  compactHidden?: boolean;
}

const COLUMNS: Column[] = [
  { field: 'name', label: 'Наименование' },
  { field: 'category', label: 'Категория', compactHidden: true },
  { field: 'date', label: 'Дата', compactHidden: true },
  { field: 'amount', label: 'Сумма', align: 'right' },
];

// Для даты и суммы логичнее начинать с убывания, для текстовых полей — с возрастания.
function defaultOrder(field: TransactionsSortField): TransactionsSort['order'] {
  return field === 'date' || field === 'amount' ? 'desc' : 'asc';
}

function nextSort(
  current: TransactionsSort | undefined,
  field: TransactionsSortField,
): TransactionsSort {
  if (current?.field === field) {
    return { field, order: current.order === 'asc' ? 'desc' : 'asc' };
  }
  return { field, order: defaultOrder(field) };
}

function ColumnHeader({
  column,
  sort,
  onSortChange,
}: {
  column: Column;
  sort?: TransactionsSort;
  onSortChange?: (sort: TransactionsSort) => void;
}) {
  const active = sort?.field === column.field;
  const sortable = Boolean(sort && onSortChange);
  const alignRight = column.align === 'right';

  const label = (
    <span className="inline-flex items-center gap-1.5">
      {column.label}
      {sortable ? (
        <Icon
          name={active ? (sort?.order === 'asc' ? 'arrow-up' : 'arrow-down') : 'arrow-up-down'}
          className={cn('size-3.5 transition-opacity', active ? 'opacity-100' : 'opacity-40')}
        />
      ) : null}
    </span>
  );

  return (
    <th
      scope="col"
      aria-sort={
        active ? (sort?.order === 'asc' ? 'ascending' : 'descending') : sortable ? 'none' : undefined
      }
      className={cn(
        'py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground',
        alignRight ? 'pl-3 pr-1 text-right' : 'pr-3 pl-1 text-left',
        column.compactHidden && 'hidden sm:table-cell',
      )}
    >
      {sortable && onSortChange ? (
        <button
          type="button"
          onClick={() => onSortChange(nextSort(sort, column.field))}
          className={cn(
            'rounded-lg px-1.5 py-1 transition-colors duration-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
            active ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {label}
        </button>
      ) : (
        <span className="px-1.5 py-1">{label}</span>
      )}
    </th>
  );
}

function GroupHeader({
  group,
  grouping,
  showDivider,
}: {
  group: TransactionGroup;
  grouping: TransactionsGrouping;
  showDivider: boolean;
}) {
  const isPositive = group.total > 0;
  const isNegative = group.total < 0;

  return (
    <tr className={cn(showDivider && 'border-t border-border/60')}>
      <td colSpan={3} className="pt-4 pb-1.5">
        <div className="flex items-center gap-2">
          {grouping === 'category' ? (
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: group.color ?? '#818cf8' }}
            />
          ) : null}
          <span className="text-[11px] leading-4 font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {group.label}
          </span>
          <span className="rounded-full border border-border/60 bg-background/40 px-1.5 py-0.5 text-[10px] leading-4 tabular-nums text-muted-foreground">
            {group.items.length}
          </span>
        </div>
      </td>
      <td className="pt-4 pr-1 pb-1.5 pl-3 text-right">
        <span
          className={cn(
            'text-[11px] leading-4 font-semibold tabular-nums',
            isPositive ? 'text-positive' : isNegative ? 'text-negative' : 'text-muted-foreground',
          )}
        >
          {isPositive ? '+' : isNegative ? '−' : ''}
          {formatMoney(Math.abs(group.total))}
        </span>
      </td>
    </tr>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          <td className="py-3 pr-3 pl-1">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 shrink-0 rounded-xl" />
              <Skeleton className="h-4 w-40" />
            </div>
          </td>
          <td className="hidden px-3 py-3 sm:table-cell">
            <Skeleton className="h-4 w-24" />
          </td>
          <td className="hidden px-3 py-3 sm:table-cell">
            <Skeleton className="h-4 w-16" />
          </td>
          <td className="py-3 pr-1 pl-3">
            <Skeleton className="ml-auto h-4 w-20" />
          </td>
        </tr>
      ))}
    </>
  );
}

export function TransactionsList({
  data,
  loading,
  error,
  page,
  totalPages,
  total,
  setPage,
  emptyTitle = 'Транзакций пока нет',
  emptyDescription = 'Добавьте первый доход или расход — он появится здесь.',
  emptyAction,
  onSelect,
  grouping = 'none',
  sort,
  onSortChange,
}: TransactionsListProps) {
  if (error) {
    return (
      <div
        role="alert"
        className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        <Icon name="warning" className="size-4" />
        Не удалось загрузить транзакции: {error}
      </div>
    );
  }

  const items = data?.items.map(toTransaction) ?? [];
  const groups = grouping === 'none' ? null : groupTransactions(items, grouping);
  const isEmpty = !loading && items.length === 0;

  return (
    <div className="flex flex-col">
      {isEmpty ? (
        <EmptyState
          icon="receipt"
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border/60">
                {COLUMNS.map((column) => (
                  <ColumnHeader
                    key={column.field}
                    column={column}
                    sort={sort}
                    onSortChange={onSortChange}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <LoadingRows />
              ) : groups ? (
                groups.map((group, index) => (
                  <Fragment key={group.key}>
                    <GroupHeader group={group} grouping={grouping} showDivider={index > 0} />
                    {group.items.map((transaction) => (
                      <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                        onSelect={onSelect}
                      />
                    ))}
                  </Fragment>
                ))
              ) : (
                items.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    onSelect={onSelect}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-4">
          <p className="text-xs text-muted-foreground tabular-nums">
            {total} записей · стр. {page} из {totalPages}
          </p>
          <div className="flex gap-1.5">
            <Button
              variant="secondary"
              size="icon-sm"
              aria-label="Предыдущая страница"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1 || loading}
            >
              <Icon name="chevron-left" className="size-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              aria-label="Следующая страница"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages || loading}
            >
              <Icon name="chevron-right" className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
