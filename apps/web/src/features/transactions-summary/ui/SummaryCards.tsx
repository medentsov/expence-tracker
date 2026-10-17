'use client';

import type { TransactionsSummary } from '@tracker/shared';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatMoney } from '@/shared/lib/format';

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

interface SummaryCardsProps {
  data: TransactionsSummary | null;
  loading: boolean;
  error: string | null;
}

export function SummaryCards({ data, loading, error }: SummaryCardsProps) {
  if (error) {
    return (
      <p className="text-sm text-muted-foreground">
        Не удалось загрузить сводку: {error}
      </p>
    );
  }

  const monthLabel = data
    ? `${MONTH_NAMES[data.month - 1]} ${data.year}`
    : '...';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Доходы
          </CardTitle>
          <TrendingUp className="size-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-7 w-28" />
          ) : (
            <div className="text-2xl font-bold text-emerald-600">
              {formatMoney(data?.totalIncome ?? 0)}
            </div>
          )}
          <p className="text-xs text-muted-foreground">{monthLabel}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Расходы
          </CardTitle>
          <TrendingDown className="size-4 text-red-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-7 w-28" />
          ) : (
            <div className="text-2xl font-bold text-red-600">
              {formatMoney(data?.totalExpense ?? 0)}
            </div>
          )}
          <p className="text-xs text-muted-foreground">{monthLabel}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Баланс
          </CardTitle>
          <Wallet className="size-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-7 w-28" />
          ) : (
            <div
              className={`text-2xl font-bold ${
                (data?.balance ?? 0) >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}
            >
              {formatMoney(data?.balance ?? 0)}
            </div>
          )}
          <p className="text-xs text-muted-foreground">{monthLabel}</p>
        </CardContent>
      </Card>
    </div>
  );
}