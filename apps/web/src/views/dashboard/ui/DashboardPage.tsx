'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '@/entities/session';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';

// Защищённая страница профиля: данные текущего пользователя и кнопка выхода.
export function DashboardPage() {
  const { user, signOut } = useSession();
  const router = useRouter();

  function handleSignOut(): void {
    signOut();
    router.replace('/login');
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Профиль</CardTitle>
        <CardDescription>Вы вошли в трекер. Разделы расходов и категорий — в следующей итерации.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="text-sm">
          <div className="flex justify-between border-b py-2">
            <dt className="text-muted-foreground">Имя</dt>
            <dd>{user?.name ?? '—'}</dd>
          </div>
          <div className="flex justify-between border-b py-2">
            <dt className="text-muted-foreground">Email</dt>
            <dd>{user?.email ?? '—'}</dd>
          </div>
        </dl>
        <Button type="button" variant="outline" className="w-full" onClick={handleSignOut}>
          Выйти
        </Button>
      </CardContent>
    </Card>
  );
}
