import type * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Icon, type IconName } from '@/shared/ui/icon';
import { Skeleton } from '@/shared/ui/skeleton';

const TONES = {
  mint: 'bg-tint-mint',
  sky: 'bg-tint-sky',
  peach: 'bg-tint-peach',
} as const;

export type StatCardTone = keyof typeof TONES;

interface StatCardProps extends React.ComponentProps<'div'> {
  /** Пастельный фон карточки. */
  tone: StatCardTone;
  icon: IconName;
  label: string;
  /** Готовая строка суммы (форматирование снаружи). */
  value: string;
  /** Подпись под суммой: период, пояснение. */
  hint?: string;
  /** Знак «плюс/минус» в метке не нужен: цвет задаёт тон. */
  valueClassName?: string;
  /** Показывает плейсхолдер вместо суммы. */
  loading?: boolean;
}

// KPI-карточка: пастельная подложка, иконка в тёмном скруглённом квадрате,
// крупная сумма. Держим в shared — используется на нескольких экранах.
export function StatCard({
  tone,
  icon,
  label,
  value,
  hint,
  valueClassName,
  loading,
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-border/60 p-5 backdrop-blur-xl',
        TONES[tone],
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-ink-panel text-ink-panel-foreground">
          <Icon name={icon} className="size-5" />
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {loading ? (
          <Skeleton className="my-1 h-8 w-32 bg-foreground/10" />
        ) : (
          <span
            className={cn(
              'font-display text-2xl font-bold tracking-tight tabular-nums lg:text-3xl',
              valueClassName,
            )}
          >
            {value}
          </span>
        )}
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
    </div>
  );
}
