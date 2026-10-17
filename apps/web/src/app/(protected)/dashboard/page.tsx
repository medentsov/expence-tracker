import type { Metadata } from 'next';
import { DashboardPage } from '@/views/dashboard/ui/DashboardPage';

export const metadata: Metadata = { title: 'Профиль — Трекер расходов' };

export default function DashboardRoute() {
  return <DashboardPage />;
}