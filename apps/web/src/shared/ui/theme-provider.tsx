'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps } from 'react';

// Обёртка над next-themes: тема переключается классом `dark` на <html>,
// поэтому хватает существующего `@custom-variant dark` в globals.css.
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
