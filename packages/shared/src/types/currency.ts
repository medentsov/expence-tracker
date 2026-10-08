// Код валюты по ISO 4217 (ограниченный набор, расширяется при необходимости).
export type CurrencyCode = 'RUB' | 'USD' | 'EUR';

// Валюта расхода с отображением в UI.
export const CURRENCIES: Record<CurrencyCode, { symbol: string; label: string }> = {
  RUB: { symbol: '₽', label: 'Рубль' },
  USD: { symbol: '$', label: 'Доллар США' },
  EUR: { symbol: '€', label: 'Евро' },
};