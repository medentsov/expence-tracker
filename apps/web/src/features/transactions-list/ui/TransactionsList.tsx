'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { useTransactions } from '../model/use-transactions';
import { TransactionItem } from './TransactionItem';

export function TransactionsList() {
  const { data, loading, error, page, totalPages, total, setPage } = useTransactions();

  // Ошибка
  if (error) {
    return (
      <p className="text-sm text-muted-foreground">
        Не удалось загрузить транзакции: {error}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Скелетоны при загрузке */}
      {loading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))
      ) : data && data.items.length > 0 ? (
        data.items.map((t) => <TransactionItem key={t.id} transaction={t} />)
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Транзакций пока нет
        </p>
      )}

      {/* Пагинация — только если больше одной страницы */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            {total} записей · стр. {page} из {totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages || loading}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}