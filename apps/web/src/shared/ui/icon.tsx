import type { SVGProps } from 'react';
import { cn } from '@/shared/lib/utils';

// Все иконки — inline SVG. Никаких icon-пакетов: пути хранятся строками
// и рендерятся одним <path>, поэтому в разметке нет лишних корневых элементов.
const ICON_PATHS = {
  wallet: [
    'M19 7V6a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6',
    'M16 12h.01',
  ],
  'trending-up': ['M22 7 13.5 15.5 8.5 10.5 2 17', 'M16 7h6v6'],
  'trending-down': ['M22 17 13.5 8.5 8.5 13.5 2 7', 'M16 17h6v-6'],
  'arrow-up-right': ['M7 17 17 7', 'M7 7h10v10'],
  'arrow-down-left': ['M17 7 7 17', 'M7 7v10h10'],
  plus: ['M12 5v14', 'M5 12h14'],
  pencil: ['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'],
  trash: [
    'M3 6h18',
    'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6',
    'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    'M10 11v6',
    'M14 11v6',
  ],
  'arrow-up': ['m5 12 7-7 7 7', 'M12 19V5'],
  'arrow-down': ['M12 5v14', 'm19 12-7 7-7-7'],
  'arrow-up-down': ['m21 16-4 4-4-4', 'M17 20V4', 'm3 8 4-4 4 4', 'M7 4v16'],
  layers: [
    'm12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z',
    'm22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65',
    'm22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65',
  ],
  receipt: [
    'M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z',
    'M8 7h8',
    'M8 11h8',
    'M8 15h5',
  ],
  tags: [
    'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z',
    'M7 7h.01',
  ],
  'layout-dashboard': ['M3 3h7v9H3z', 'M14 3h7v5h-7z', 'M14 12h7v9h-7z', 'M3 16h7v5H3z'],
  logout: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'm16 17 5-5-5-5', 'M21 12H9'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  sun: [
    'M12 2v2',
    'M12 20v2',
    'm4.93 4.93 1.41 1.41',
    'm17.66 17.66 1.41 1.41',
    'M2 12h2',
    'M20 12h2',
    'm6.34 17.66-1.41 1.41',
    'm19.07 4.93-1.41 1.41',
    'M12 8a4 4 0 1 0 0 8 4 4 0 1 0 0-8',
  ],
  moon: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'],
  'chevron-left': ['m15 18-6-6 6-6'],
  'chevron-right': ['m9 18 6-6-6-6'],
  'chevron-down': ['m6 9 6 6 6-6'],
  'chevron-up': ['m18 15-6-6-6 6'],
  check: ['M20 6 9 17l-5-5'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
  filter: ['M3 6h18', 'M7 12h10', 'M10 18h4'],
  loader: [
    'M12 2v4',
    'm16.24 7.76 2.83-2.83',
    'M18 12h4',
    'm16.24 16.24 2.83 2.83',
    'M12 18v4',
    'm4.93 19.07 2.83-2.83',
    'M2 12h4',
    'm4.93 4.93 2.83 2.83',
  ],
  'circle-check': ['M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20', 'm8 12 3 3 5-6'],
  info: ['M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20', 'M12 16v-4', 'M12 8h.01'],
  warning: [
    'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z',
    'M12 9v4',
    'M12 17h.01',
  ],
  'circle-x': ['M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20', 'm15 9-6 6', 'm9 9 6 6'],
  circle: ['M12 10a2 2 0 1 0 0 4 2 2 0 1 0 0-4'],
  sparkles: [
    'm12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z',
    'M5 3v4',
    'M3 5h4',
    'M19 17v4',
    'M17 19h4',
  ],
  'shopping-bag': [
    'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z',
    'M3 6h18',
    'M16 10a4 4 0 0 1-8 0',
  ],
  utensils: [
    'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2',
    'M7 2v20',
    'M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7',
  ],
  car: [
    'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2',
    'M9 17h6',
    'M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
    'M17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  ],
  home: ['m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z', 'M9 22V12h6v10'],
  health: [
    'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
    'M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27',
  ],
  gift: [
    'M20 12v10H4V12',
    'M2 7h20v5H2z',
    'M12 22V7',
    'M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7Z',
    'M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z',
  ],
  plane: [
    'M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z',
  ],
  coffee: [
    'M10 2v2',
    'M14 2v2',
    'M6 2v2',
    'M18 8a4 4 0 0 1 0 8h-1',
    'M17 8H3v9a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V8Z',
  ],
  briefcase: [
    'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16',
    'M20 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z',
  ],
  education: ['M22 10 12 5 2 10l10 5 10-5Z', 'M6 12v5c3 3 9 3 12 0v-5'],
  sport: [
    'm6.5 6.5 11 11',
    'm21 21-1-1',
    'm3 3 1 1',
    'm18 22 4-4',
    'm2 6 4-4',
    'm3 10 7-7',
    'm14 21 7-7',
  ],
  gamepad: [
    'M6 11h4',
    'M8 9v4',
    'M15 12h.01',
    'M18 10h.01',
    'M17.32 5H6.68a4 4 0 0 0-3.97 3.46l-.56 5A4 4 0 0 0 6.17 18h.5a2 2 0 0 0 1.6-.8l1.15-1.55a1 1 0 0 1 .8-.4h3.56a1 1 0 0 1 .8.4l1.15 1.55a2 2 0 0 0 1.6.8h.5a4 4 0 0 0 3.98-4.54l-.56-5A4 4 0 0 0 17.32 5Z',
  ],
  phone: [
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z',
  ],
  card: ['M2 5h20v14H2z', 'M2 10h20'],
} as const satisfies Record<string, readonly string[]>;

export type IconName = keyof typeof ICON_PATHS;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
}

// Единственный компонент иконок в приложении: ключ -> набор path-строк.
// Содержимое обёрнуто в <g>, поэтому SVG всегда состоит из одного узла.
export function Icon({ name, size = 24, className, strokeWidth = 1.8, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
      aria-hidden
      {...props}
    >
      <g>
        {ICON_PATHS[name].map((d, index) => (
          <path key={`${name}-${index}`} d={d} />
        ))}
      </g>
    </svg>
  );
}

// Иконка подбирается по названию категории: API отдаёт свободный текст,
// поэтому используем широкий набор русских и английских ключей.
const CATEGORY_ICON_RULES: readonly { keywords: readonly string[]; icon: IconName }[] = [
  { keywords: ['продукт', 'еда', 'food', 'grocery', 'supermarket'], icon: 'shopping-bag' },
  { keywords: ['кафе', 'ресторан', 'coffee', 'cafe', 'бар', 'обед'], icon: 'coffee' },
  { keywords: ['транспорт', 'такси', 'car', 'taxi', 'метро', 'бензин'], icon: 'car' },
  { keywords: ['дом', 'home', 'аренда', 'квартир', 'жкх', 'коммунал'], icon: 'home' },
  { keywords: ['здоров', 'медиц', 'health', 'аптек', 'doctor'], icon: 'health' },
  { keywords: ['зарплат', 'salary', 'доход', 'income', 'бонус'], icon: 'briefcase' },
  { keywords: ['подар', 'gift', 'праздник'], icon: 'gift' },
  { keywords: ['путеш', 'travel', 'отпуск', 'plane', 'авиа'], icon: 'plane' },
  { keywords: ['образов', 'учёб', 'учеб', 'education', 'курс', 'школ'], icon: 'education' },
  { keywords: ['спорт', 'sport', 'фитнес', 'gym', 'трениров'], icon: 'sport' },
  { keywords: ['развлеч', 'game', 'игр', 'кино'], icon: 'gamepad' },
  { keywords: ['подписк', 'subscription', 'тариф'], icon: 'card' },
  { keywords: ['связ', 'phone', 'интернет', 'мобил'], icon: 'phone' },
  { keywords: ['одежд', 'clothes', 'обувь', 'шопинг'], icon: 'shopping-bag' },
];

export function iconForCategory(name?: string | null): IconName {
  const normalized = name?.trim().toLowerCase() ?? '';
  const match = CATEGORY_ICON_RULES.find(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(keyword)),
  );
  return match?.icon ?? 'receipt';
}
