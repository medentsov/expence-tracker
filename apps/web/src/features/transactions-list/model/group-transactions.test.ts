import { describe, expect, it } from 'vitest';
import { groupTransactions } from './group-transactions';
import type { Transaction } from './types';

function makeTransaction(overrides: Partial<Transaction>): Transaction {
	return {
		id: 'tx-1',
		amount: 1000,
		type: 'EXPENSE',
		description: null,
		date: '2026-10-25T12:00:00.000Z',
		categoryId: 'cat-1',
		category: { id: 'cat-1', name: 'Продукты', color: '#34d399', icon: null },
		...overrides,
	};
}

describe('groupTransactions', () => {
	it('без группировки возвращает пустой массив', () => {
		expect(groupTransactions([makeTransaction({})], 'none')).toEqual([]);
	});

	it('группирует по датам, сохраняя порядок элементов', () => {
		const first = makeTransaction({
			id: 'tx-1',
			date: '2026-10-25T12:00:00.000Z',
			amount: 800,
		});
		const second = makeTransaction({
			id: 'tx-2',
			date: '2026-10-25T18:00:00.000Z',
			amount: 1200,
		});
		const third = makeTransaction({
			id: 'tx-3',
			date: '2026-10-24T09:00:00.000Z',
			type: 'INCOME',
			amount: 5000,
		});

		const groups = groupTransactions([first, second, third], 'date');

		expect(groups).toHaveLength(2);
		expect(groups[0].key).toBe('2026-10-25');
		expect(groups[0].items.map((item) => item.id)).toEqual(['tx-1', 'tx-2']);
		expect(groups[0].total).toBe(-2000);
		expect(groups[1].key).toBe('2026-10-24');
		expect(groups[1].total).toBe(5000);
	});

	it('группирует по категориям и переносит цвет категории', () => {
		const food = makeTransaction({ id: 'tx-1', amount: 700 });
		const salary = makeTransaction({
			id: 'tx-2',
			type: 'INCOME',
			amount: 150000,
			categoryId: 'cat-2',
			category: { id: 'cat-2', name: 'Зарплата', color: '#facc15', icon: null },
		});
		const foodAgain = makeTransaction({ id: 'tx-3', amount: 300 });

		const groups = groupTransactions([food, salary, foodAgain], 'category');

		expect(groups).toHaveLength(2);
		expect(groups[0]).toMatchObject({ key: 'cat-1', label: 'Продукты', color: '#34d399' });
		expect(groups[0].items).toHaveLength(2);
		expect(groups[0].total).toBe(-1000);
		expect(groups[1]).toMatchObject({ key: 'cat-2', label: 'Зарплата', color: '#facc15' });
		expect(groups[1].total).toBe(150000);
	});

	it('складывает операции без категории в группу «Без категории»', () => {
		const uncategorized = makeTransaction({
			id: 'tx-1',
			category: null,
		});

		const groups = groupTransactions([uncategorized], 'category');

		expect(groups).toHaveLength(1);
		expect(groups[0]).toMatchObject({ key: 'none', label: 'Без категории', color: null });
	});
});
