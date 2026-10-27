import type { Metadata } from 'next';
import { CategoriesPage } from '@/views/categories/ui/CategoriesPage';

export const metadata: Metadata = { title: 'Категории — Трекер расходов' };

export default function CategoriesRoute() {
	return <CategoriesPage />;
}
