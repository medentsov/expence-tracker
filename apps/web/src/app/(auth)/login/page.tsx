import type { Metadata } from 'next';
import { LoginPage } from '@/views/login/ui/LoginPage';

export const metadata: Metadata = { title: 'Вход — Трекер расходов' };

export default function LoginRoute() {
	return <LoginPage />;
}
