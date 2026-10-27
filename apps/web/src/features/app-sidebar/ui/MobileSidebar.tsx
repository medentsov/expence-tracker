'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui/sheet';
import { SidebarLogo, SidebarNav } from './SidebarNav';

// Мобильное меню: та же навигация в Sheet (Radix Dialog — новых зависимостей не нужно).
export function MobileSidebar({ createAction }: { createAction?: ReactNode }) {
	const [open, setOpen] = useState(false);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" aria-label="Открыть меню" className="lg:hidden">
					<Icon name="menu" className="size-5" />
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="w-72 gap-8 px-4 py-6">
				<SheetHeader className="sr-only">
					<SheetTitle>Меню</SheetTitle>
				</SheetHeader>
				<SidebarLogo onNavigate={() => setOpen(false)} />
				<SidebarNav onNavigate={() => setOpen(false)} />
				{createAction ? <div className="mt-auto">{createAction}</div> : null}
			</SheetContent>
		</Sheet>
	);
}
