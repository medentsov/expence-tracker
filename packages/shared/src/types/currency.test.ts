import { describe, expect, it } from 'vitest';
import { CURRENCIES } from './currency';

describe('CURRENCIES', () => {
	it('содержит все поддерживаемые валюты', () => {
		expect(Object.keys(CURRENCIES).sort()).toEqual(['EUR', 'RUB', 'USD']);
	});

	it('у каждой валюты есть символ и подпись', () => {
		for (const value of Object.values(CURRENCIES)) {
			expect(typeof value.symbol).toBe('string');
			expect(typeof value.label).toBe('string');
		}
	});
});
