'use client';

import { useCallback, useState } from 'react';
import { SummaryCards } from '@/features/transactions-summary';
import { TransactionsList } from '@/features/transactions-list';
import { CreateTransactionButton } from '@/features/transaction-create';

// Главный экран: сводка за текущий месяц и последние транзакции с пагинацией.
export function DashboardPage() {
  // Счётчик обновления — после создания транзакции перерисовываем список и сводку.
  const [version, setVersion] = useState(0);

  const handleCreated = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Главная</h1>
          <CreateTransactionButton onCreated={handleCreated} />
        </div>
        <SummaryCards key={`summary-${version}`} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Последние транзакции</h2>
        <TransactionsList key={`list-${version}`} />
      </section>
    </div>
  );
}