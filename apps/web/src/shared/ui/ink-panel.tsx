import type * as React from 'react';
import { cn } from '@/shared/lib/utils';

// Тёмная акцентная панель — единственный контрастный блок в интерфейсе.
// В тёмной теме остаётся тёмной, но чуть светлее фона, чтобы читалась как плита.
function InkPanel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="ink-panel"
      className={cn(
        'flex flex-col rounded-3xl border border-border/70 bg-ink-panel p-6 text-ink-panel-foreground backdrop-blur-xl',
        className,
      )}
      {...props}
    />
  );
}

function InkPanelHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="ink-panel-header"
      className={cn('flex items-center justify-between gap-3', className)}
      {...props}
    />
  );
}

function InkPanelTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="ink-panel-title"
      className={cn('font-display text-lg font-semibold', className)}
      {...props}
    />
  );
}

function InkPanelRow({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="ink-panel-row"
      className={cn('flex items-center justify-between gap-3 py-3', className)}
      {...props}
    />
  );
}

export { InkPanel, InkPanelHeader, InkPanelTitle, InkPanelRow };
