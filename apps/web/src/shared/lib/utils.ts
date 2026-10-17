// Утилита слияния классов. Единая точка доступа для shadcn-компонентов:
// использует пакет `cn` (drop-in замена clsx + tailwind-merge), который
// ставится shadcn CLI 4.x. Хранится в shared/lib и импортируется как `@/shared/lib/utils`.
export { cn } from 'cn';
export type { ClassValue } from 'cn';