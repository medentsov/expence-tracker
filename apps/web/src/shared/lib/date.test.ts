import { describe, expect, it } from 'vitest';
import { todayInputDate } from '@/shared/lib/date';

describe('todayInputDate', () => {
	it('возвращает строку в формате YYYY-MM-DD', () => {
		expect(todayInputDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});
});
