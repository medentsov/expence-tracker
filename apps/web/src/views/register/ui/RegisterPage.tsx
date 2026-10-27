import { RegisterForm } from '@/features/auth-register';

export function RegisterPage() {
	return (
		<div className="flex w-full flex-col gap-6">
			<div className="flex flex-col gap-1.5">
				<h1 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">Регистрация</h1>
				<p className="text-sm text-muted-foreground">Создайте аккаунт, чтобы начать вести учёт расходов.</p>
			</div>
			<RegisterForm />
		</div>
	);
}
