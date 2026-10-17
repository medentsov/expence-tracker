import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SessionProvider } from '@/entities/session';
import { Toaster } from '@/shared/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Трекер расходов',
  description: 'Трекер личных расходов',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
