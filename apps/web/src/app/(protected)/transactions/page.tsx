import type { Metadata } from 'next';
import { TransactionsPage } from '@/views/transactions/ui/TransactionsPage';

export const metadata: Metadata = { title: 'Транзакции — Трекер расходов' };

export default function TransactionsRoute() {
  return <TransactionsPage />;
}