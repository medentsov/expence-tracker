import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Пользовательское соглашение — Трекер расходов' };

export default function TermsPage() {
  return (
    <main className="flex min-h-screen justify-center bg-background p-3 sm:p-6">
      <article className="w-full max-w-2xl self-start rounded-3xl bg-surface px-6 py-10 sm:px-10">
        <h1 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">
          Пользовательское соглашение
        </h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Настоящий документ регулирует отношения между пользователем и сервисом «Трекер расходов».
          Используя сервис, вы соглашаетесь с условиями данного соглашения.
        </p>
      </article>
    </main>
  );
}
