import type { Metadata } from 'next';
import { RegisterPage } from '@/views/register/ui/RegisterPage';

export const metadata: Metadata = { title: 'Регистрация — Трекер расходов' };

export default function RegisterRoute() {
	return <RegisterPage />;
}
