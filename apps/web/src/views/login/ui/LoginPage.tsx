import { LoginForm } from '@/features/auth-login';

export function LoginPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">Вход</h1>
        <p className="text-sm text-muted-foreground">
          Введите email и пароль, чтобы вернуться к своим расходам.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
