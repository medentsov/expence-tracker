import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

// Заглушка раздела транзакций — наполнение в следующей итерации.
export function TransactionsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Транзакции</CardTitle>
        <CardDescription>
          Полный список транзакций с фильтрами появится в следующей итерации.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}