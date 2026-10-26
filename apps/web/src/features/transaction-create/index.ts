export { CreateTransactionButton } from './ui/CreateTransactionButton';
export { EditTransactionDialog } from './ui/EditTransactionDialog';
export type { EditableTransaction } from './model/types';
// Хук справочника категорий переиспользуется страницей «Категории»:
// выносить его в отдельный слайс мешает правило «без кросс-импортов внутри слоя».
export { useCategories } from './model/use-categories';
