import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Политика обработки данных — Трекер расходов' };

export default function PrivacyPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold">Политика обработки данных</h1>
        <p className="mt-4 text-muted-foreground">
          Мы обрабатываем только те данные, которые необходимы для работы сервиса: email,
          имя (опционально) и информацию о расходах. Данные не передаются третьим лицам и
          хранятся в зашифрованном виде на территории РФ.
        </p>
      </div>
    </main>
  );
}