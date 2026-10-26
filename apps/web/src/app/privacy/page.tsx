import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Политика обработки данных — Трекер расходов' };

export default function PrivacyPage() {
  return (
    <main className="flex min-h-screen justify-center bg-background p-3 sm:p-6">
      <article className="w-full max-w-2xl self-start rounded-3xl bg-surface px-6 py-10 sm:px-10">
        <h1 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">
          Политика обработки данных
        </h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Мы обрабатываем только те данные, которые необходимы для работы сервиса: email,
          имя (опционально) и информацию о расходах. Данные не передаются третьим лицам и
          хранятся в зашифрованном виде на территории РФ.
        </p>
      </article>
    </main>
  );
}
