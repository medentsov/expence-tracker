import type { TransactionsSummary } from '@tracker/shared';

// Строгая модель сводки для UI. Не зависит от DTO: если API поменяет
// названия полей, адаптер ниже — единственное место для правки.
export interface WalletStats {
  readonly totalIncome: number;
  readonly totalExpense: number;
  readonly balance: number;
  readonly month: number;
  readonly year: number;
}

export function toWalletStats(summary: TransactionsSummary | null): WalletStats | null {
  if (!summary) return null;

  return {
    totalIncome: summary.totalIncome,
    totalExpense: summary.totalExpense,
    balance: summary.balance,
    month: summary.month,
    year: summary.year,
  };
}
