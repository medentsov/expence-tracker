'use client';

import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

interface CreateCategoryButtonProps {
	onClick: () => void;
}

export function CreateCategoryButton({ onClick }: CreateCategoryButtonProps) {
	return (
		<Button onClick={onClick}>
			<Icon name="plus" className="size-4" />
			Новая категория
		</Button>
	);
}
