'use client';

import { useCallback, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui/card';
import { Icon } from '@/shared/ui/icon';
import { MonthLedger, SummaryCards, useSummary } from '@/features/transactions-summary';
import { TransactionsList, useTransactions } from '@/features/transactions-list';
import {
	CreateTransactionButton,
	EditTransactionDialog,
	type EditableTransaction,
} from '@/features/transaction-create';

// Главный экран: сводка за текущий месяц, стеклянная панель итогов
// и последние транзакции с пагинацией.
export function DashboardPage() {
	const summary = useSummary();
	const transactions = useTransactions();
	const [selected, setSelected] = useState<EditableTransaction | null>(null);

	// После создания или изменения транзакции обновляем данные без перемонтирования.
	const handleChanged = useCallback(() => {
		summary.refetch();
		transactions.refetch();
	}, [summary.refetch, transactions.refetch]);

	return (
		<div className="flex flex-col gap-6">
			<section className="flex flex-col gap-5">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div className="flex flex-col gap-2">
						<span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-card/50 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-xl">
							<span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
							Финансовый обзор
						</span>
						<h1 className="bg-gradient-to-r from-foreground via-foreground to-foreground/55 bg-clip-text font-display text-3xl font-bold tracking-tight text-transparent lg:text-4xl">
							Обзор
						</h1>
						<p className="text-sm text-muted-foreground">Доходы, расходы и баланс за текущий месяц</p>
					</div>
					<CreateTransactionButton onCreated={handleChanged} />
				</div>

				<SummaryCards data={summary.data} loading={summary.loading} error={summary.error} />
			</section>

			<section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
				<Card className="overflow-hidden">
					<CardHeader className="flex flex-row items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<span className="flex size-10 items-center justify-center rounded-2xl border border-border/70 bg-background/40 text-primary">
								<Icon name="receipt" className="size-5" />
							</span>
							<div className="flex flex-col gap-0.5">
								<CardTitle>Последние операции</CardTitle>
								<CardDescription>Последние 10 записей</CardDescription>
							</div>
						</div>
						<span className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-background/40 px-2.5 py-1 text-[10px] font-medium text-muted-foreground sm:inline-flex">
							<Icon name="sparkles" className="size-3" />
							онлайн
						</span>
					</CardHeader>
					<CardContent>
						<TransactionsList
							data={transactions.data}
							loading={transactions.loading}
							error={transactions.error}
							page={transactions.page}
							totalPages={transactions.totalPages}
							total={transactions.total}
							setPage={transactions.setPage}
							onSelect={setSelected}
							emptyAction={<CreateTransactionButton onCreated={handleChanged} />}
						/>
					</CardContent>
				</Card>

				<MonthLedger data={summary.data} loading={summary.loading} error={summary.error} />
			</section>

			<EditTransactionDialog transaction={selected} onClose={() => setSelected(null)} onUpdated={handleChanged} />
		</div>
	);
}
