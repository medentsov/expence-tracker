import { SetMetadata } from '@nestjs/common';

// Ключ метаданных, помечающий эндпоинт как публичный (не требует JWT).
export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);