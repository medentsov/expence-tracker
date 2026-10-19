'use client';

import type { Transaction } from '@tracker/shared';
import { Badge } from '@/shared/ui/badge';
import { formatDate, formatMoney } from '@/shared/lib/format';

function categoryColor(hex: string | null | undefined): string {
  return hex ?? '#6b7280';
}

export function TransactionItem({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === 'INCOME';
  const color = categoryColor(transaction.category?.color);

  return (
    <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
      {/* Цветной маркер категории */}
      <div
        className="size-3 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">
            {transaction.description || transaction.category?.name || '—'}
          </span>
          {transaction.category?.name ? (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {transaction.category.name}
            </Badge>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
      </div>

      <div
        className={`shrink-0 text-sm font-semibold tabular-nums ${
          isIncome ? 'text-emerald-600' : 'text-red-600'
        }`}
      >
        {isIncome ? '+' : '−'}{formatMoney(transaction.amount)}
      </div>
    </div>
  );
}