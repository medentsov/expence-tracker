import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import type { ReactNode } from 'react';
import { SessionProvider } from '@/entities/session';
import { Toaster } from '@/shared/ui/sonner';
import { ThemeProvider } from '@/shared/ui/theme-provider';
import './globals.css';

// Manrope — заголовки и суммы; Inter — основной текст.
// subsets 'cyrillic' обязателен: интерфейс полностью на русском,
// без него браузер подставит системный fallback прямо посреди текста.
const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Трекер расходов',
  description: 'Трекер личных расходов',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // suppressHydrationWarning — next-themes выставляет класс темы до гидрации.
    <html lang="ru" suppressHydrationWarning className={`${manrope.variable} ${inter.variable}`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
