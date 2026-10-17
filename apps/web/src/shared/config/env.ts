// Базовый URL API. NEXT_PUBLIC_* инлайнится в бандл на этапе сборки,
// поэтому значение по умолчанию задано здесь же (для локальной разработки).
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
