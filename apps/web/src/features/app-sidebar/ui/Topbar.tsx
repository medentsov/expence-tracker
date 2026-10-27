'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '@/entities/session';
import { Button } from '@/shared/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Icon } from '@/shared/ui/icon';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

// Верхняя полоса панели контента: тема и профиль. Навигация — в сайдбаре.
export function Topbar() {
	const router = useRouter();
	const { user, signOut } = useSession();

	const displayName = user?.name?.trim() || user?.email || 'Профиль';
	const initial = displayName.charAt(0).toUpperCase();

	function handleSignOut(): void {
		signOut();
		router.replace('/login');
	}

	return (
		<div className="flex items-center justify-end gap-1.5">
			<ThemeToggle />
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="flex items-center gap-2 border border-transparent px-2 hover:border-border/60"
					>
						<span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-xs font-semibold text-white shadow-glow">
							{initial}
						</span>
						<span className="hidden max-w-40 truncate text-sm sm:inline">{displayName}</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col gap-0.5">
							<span className="truncate text-sm font-medium">{displayName}</span>
							{user?.email && user.name ? (
								<span className="truncate text-xs text-muted-foreground">{user.email}</span>
							) : null}
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem onSelect={handleSignOut} variant="destructive">
						<Icon name="logout" className="size-4" />
						Выйти
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
