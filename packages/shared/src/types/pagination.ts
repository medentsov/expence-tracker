// Обёртка для постраничной выдачи списков (offset-пагинация).
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
