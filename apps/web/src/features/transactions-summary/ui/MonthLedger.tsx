'use client';

import type { TransactionsSummary } from '@tracker/shared';
import { cn } from '@/shared/lib/utils';
import { formatMoney, formatMonth } from '@/shared/lib/format';
import { Icon } from '@/shared/ui/icon';
import { Skeleton } from '@/shared/ui/skeleton';
import { toWalletStats } from '../model/types';

interface MonthLedgerProps {
  data: TransactionsSummary | null;
  loading: boolean;
  error: string | null;
}

// Стеклянная панель итогов: кольцо распределения доход/расход строится
// из реальных цифр сводки, без выдуманной истории по месяцам.
export function MonthLedger({ data, loading, error }: MonthLedgerProps) {
  const stats = toWalletStats(data);
  const monthLabel = stats ? formatMonth(stats.month, stats.year) : 'Текущий месяц';
  const income = stats?.totalIncome ?? 0;
  const expense = stats?.totalExpense ?? 0;
  const balance = stats?.balance ?? 0;
  const turnover = income + expense;
  const incomeShare = turnover > 0 ? Math.round((income / turnover) * 100) : 50;
  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
  const savingsBar = Math.max(0, Math.min(100, savingsRate));

  return (
    <section className="relative isolate flex flex-col overflow-hidden rounded-[2rem] border border-border/70 bg-card/60 p-6 backdrop-blur-xl">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-20 -top-24 size-56 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 size-56 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Icon name="sparkles" className="size-4 text-primary" />
            <h2 className="font-display text-lg font-semibold tracking-tight">Итоги месяца</h2>
          </div>
          <p className="text-xs text-muted-foreground">{monthLabel}</p>
        </div>
        <span className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-background/40 text-muted-foreground">
          <Icon name="receipt" className="size-4" />
        </span>
      </div>

      {error ? (
        <p className="mt-6 text-sm text-muted-foreground" role="alert">
          Сводка недоступна: {error}
        </p>
      ) : (
        <>
          <div className="mt-7 flex items-center gap-5">
            <div
              className="relative flex size-36 shrink-0 items-center justify-center rounded-full p-[7px]"
              style={{
                background: `conic-gradient(#34d399 0 ${incomeShare}%, #fb7185 ${incomeShare}% 100%)`,
              }}
            >
              <div className="flex size-full flex-col items-center justify-center gap-1 rounded-full border border-border/60 bg-popover/95 text-center">
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Остаток
                </span>
                {loading ? (
                  <Skeleton className="h-6 w-20 bg-foreground/10" />
                ) : (
                  <span
                    className={cn(
                      'px-3 font-display text-base font-bold tabular-nums',
                      balance >= 0 ? 'text-foreground' : 'text-negative',
                    )}
                  >
                    {formatMoney(balance)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                  Доходы
                </span>
                {loading ? (
                  <Skeleton className="h-5 w-24 bg-foreground/10" />
                ) : (
                  <span className="font-display text-base font-semibold tabular-nums text-positive">
                    +{formatMoney(income)}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.7)]" />
                  Расходы
                </span>
                {loading ? (
                  <Skeleton className="h-5 w-24 bg-foreground/10" />
                ) : (
                  <span className="font-display text-base font-semibold tabular-nums text-negative">
                    −{formatMoney(expense)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-border/60 bg-background/30 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Норма сбережений</span>
              <span
                className={cn(
                  'font-display text-sm font-semibold tabular-nums',
                  savingsRate >= 0 ? 'text-positive' : 'text-negative',
                )}
              >
                {savingsRate}%
              </span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-foreground/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400 transition-all duration-700"
                style={{ width: `${savingsBar}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Сколько доходов осталось после расходов за период
            </p>
          </div>
        </>
      )}
    </section>
  );
}
