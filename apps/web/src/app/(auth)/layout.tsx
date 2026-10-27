'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useSession } from '@/entities/session';
import { Icon } from '@/shared/ui/icon';

const BRAND_BACKGROUND =
	'radial-gradient(110% 110% at 0% 0%, #6366f1 0%, transparent 58%),' +
	'radial-gradient(100% 100% at 100% 0%, #a855f7 0%, transparent 55%),' +
	'radial-gradient(130% 130% at 50% 120%, #4338ca 0%, transparent 60%),' +
	'linear-gradient(135deg, #312e81 0%, #4c1d95 48%, #1e1b4b 100%)';

// Публичный шелл: глубокий фон и стеклянная панель по центру.
// На десктопе слева — mesh-градиентная брендовая половина, справа форма.
// Если пользователь уже авторизован — уводим на /dashboard.
export default function AuthLayout({ children }: { children: ReactNode }) {
	const router = useRouter();
	const { status } = useSession();

	useEffect(() => {
		if (status === 'authenticated') {
			router.replace('/dashboard');
		}
	}, [router, status]);

	return (
		<main className="relative flex min-h-screen items-center justify-center overflow-hidden p-3 sm:p-6">
			<div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute -left-32 top-[-10%] size-[30rem] rounded-full bg-indigo-600/20 blur-[120px]" />
				<div className="absolute -right-32 bottom-[-15%] size-[28rem] rounded-full bg-fuchsia-600/15 blur-[120px]" />
			</div>

			<div className="grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-border/70 bg-surface/70 shadow-panel backdrop-blur-2xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
				{/* Брендовая половина — только на широких экранах */}
				<aside
					className="relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex"
					style={{ backgroundImage: BRAND_BACKGROUND }}
				>
					<div aria-hidden className="pointer-events-none absolute inset-0">
						<div className="absolute -left-20 -top-24 size-64 rounded-full bg-fuchsia-400/30 blur-3xl" />
						<div className="absolute -bottom-24 -right-16 size-64 rounded-full bg-indigo-300/25 blur-3xl" />
						<div
							className="absolute inset-0 opacity-20"
							style={{
								backgroundImage:
									'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
								backgroundSize: '42px 42px',
								maskImage: 'radial-gradient(ellipse at center, black 15%, transparent 75%)',
								WebkitMaskImage: 'radial-gradient(ellipse at center, black 15%, transparent 75%)',
							}}
						/>
					</div>

					<div className="relative flex items-center gap-3 font-display text-xl font-bold tracking-tight">
						<span className="flex size-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md">
							<Icon name="wallet" className="size-5" />
						</span>
						<span className="flex flex-col leading-none">
							<span>Трекер</span>
							<span className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
								finance
							</span>
						</span>
					</div>

					<div className="relative flex flex-col gap-4">
						<span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium backdrop-blur-md">
							<span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" />
							Личные финансы
						</span>
						<p className="font-display text-2xl font-bold leading-snug tracking-tight">
							Расходы под контролем — без таблиц и ручных подсчётов
						</p>
						<p className="text-sm leading-relaxed text-white/65">
							Записывайте доходы и траты, а сводка за месяц соберётся сама.
						</p>
					</div>

					<div className="relative grid grid-cols-3 gap-2 text-[11px] text-white/70">
						{[
							{ icon: 'trending-up' as const, label: 'Доходы' },
							{ icon: 'trending-down' as const, label: 'Расходы' },
							{ icon: 'wallet' as const, label: 'Баланс' },
						].map((item) => (
							<span
								key={item.label}
								className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.07] px-2.5 py-2 backdrop-blur-md"
							>
								<Icon name={item.icon} className="size-3.5" />
								{item.label}
							</span>
						))}
					</div>
				</aside>

				<div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12">{children}</div>
			</div>
		</main>
	);
}
