'use client';

import { useCallback } from 'react';
import { SummaryCards, useSummary } from '@/features/transactions-summary';
import { TransactionsList, useTransactions } from '@/features/transactions-list';
import { CreateTransactionButton } from '@/features/transaction-create';

// Главный экран: сводка за текущий месяц и последние транзакции с пагинацией.
export function DashboardPage() {
  const summary = useSummary();
  const transactions = useTransactions();

  // После создания транзакции обновляем данные без перемонтирования компонентов.
  const handleCreated = useCallback(() => {
    summary.refetch();
    transactions.refetch();
  }, [summary.refetch, transactions.refetch]);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Главная</h1>
          <CreateTransactionButton onCreated={handleCreated} />
        </div>
        <SummaryCards data={summary.data} loading={summary.loading} error={summary.error} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Последние транзакции</h2>
        <TransactionsList
          data={transactions.data}
          loading={transactions.loading}
          error={transactions.error}
          page={transactions.page}
          totalPages={transactions.totalPages}
          total={transactions.total}
          setPage={transactions.setPage}
        />
      </section>
    </div>
  );
}