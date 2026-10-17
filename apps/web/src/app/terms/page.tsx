import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Пользовательское соглашение — Трекер расходов' };

export default function TermsPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold">Пользовательское соглашение</h1>
        <p className="mt-4 text-muted-foreground">
          Настоящий документ регулирует отношения между пользователем и сервисом «Трекер расходов».
          Используя сервис, вы соглашаетесь с условиями данного соглашения.
        </p>
      </div>
    </main>
  );
}