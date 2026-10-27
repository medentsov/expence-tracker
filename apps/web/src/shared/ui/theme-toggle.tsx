'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

// Переключатель светлая/тёмная. До монтирования не рендерим иконку,
// чтобы разметка на сервере и клиенте не расходилась (иначе ошибка гидрации).
export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const isDark = resolvedTheme === 'dark';

	return (
		<Button
			variant="ghost"
			size="icon"
			aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
			onClick={() => setTheme(isDark ? 'light' : 'dark')}
		>
			{mounted ? (
				isDark ? (
					<Icon name="sun" className="size-5" />
				) : (
					<Icon name="moon" className="size-5" />
				)
			) : (
				<span className="size-5" />
			)}
		</Button>
	);
}
