import type { Metadata } from 'next';
import { TransactionsPage } from '@/views/transactions/ui/TransactionsPage';

export const metadata: Metadata = { title: 'Транзакции — Трекер расходов' };

interface TransactionsRouteProps {
	/** `?type=INCOME|EXPENSE` — переход с главной по плиткам «Доходы»/«Расходы». */
	searchParams: Promise<{ type?: string }>;
}

export default async function TransactionsRoute({ searchParams }: TransactionsRouteProps) {
	const { type } = await searchParams;

	return <TransactionsPage initialType={type} />;
}
