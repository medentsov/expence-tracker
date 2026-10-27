'use client';

import type { ReactNode } from 'react';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Icon } from '@/shared/ui/icon';

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: ReactNode;
	confirmLabel?: string;
	pendingLabel?: string;
	pending?: boolean;
	error?: string | null;
	onConfirm: () => void;
}

// Подтверждение необратимого действия: отдельный диалог, чтобы случайный
// клик по «Удалить» не срабатывал сразу.
export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = 'Удалить',
	pendingLabel = 'Удаляем…',
	pending = false,
	error,
	onConfirm,
}: ConfirmDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<span className="mb-1 flex size-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
						<Icon name="warning" className="size-5" />
					</span>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				{error ? (
					<p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
						{error}
					</p>
				) : null}

				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
						Отмена
					</Button>
					<Button type="button" variant="destructive" onClick={onConfirm} disabled={pending}>
						{pending ? pendingLabel : confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
