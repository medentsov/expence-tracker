// Категория расходов (ответ API).
export interface Category {
	id: string;
	name: string;
	icon?: string | null;
	color?: string | null;
	createdAt: string;
	updatedAt: string;
}

// Входные данные для создания/обновления категории.
export interface CategoryInput {
	name: string;
	icon?: string;
	color?: string;
}
