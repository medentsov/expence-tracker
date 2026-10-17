'use client';

import { SummaryCards } from '@/features/transactions-summary';
import { TransactionsList } from '@/features/transactions-list';

// Главный экран: сводка за текущий месяц и последние транзакции с пагинацией.
export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Главная</h1>
        <SummaryCards />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Последние транзакции</h2>
        <TransactionsList />
      </section>
    </div>
  );
}