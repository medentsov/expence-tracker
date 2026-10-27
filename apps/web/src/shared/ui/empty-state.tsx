import type * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Icon, type IconName } from '@/shared/ui/icon';

interface EmptyStateProps extends React.ComponentProps<'div'> {
	icon?: IconName;
	title: string;
	description?: string;
	/** Кнопка или ссылка — что сделать, чтобы состояние перестало быть пустым. */
	action?: React.ReactNode;
}

// Пустое состояние: не «заглушка», а приглашение к действию.
export function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
	return (
		<div className={cn('flex flex-col items-center gap-3 px-4 py-14 text-center', className)} {...props}>
			{icon ? (
				<span className="flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-card/60 text-muted-foreground backdrop-blur-xl">
					<Icon name={icon} className="size-6" />
				</span>
			) : null}
			<div className="flex flex-col gap-1">
				<p className="font-display text-base font-semibold">{title}</p>
				{description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
			</div>
			{action}
		</div>
	);
}
