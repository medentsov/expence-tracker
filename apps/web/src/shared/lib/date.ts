// Локальная дата в формате YYYY-MM-DD для <input type="date">.
// В отличие от toISOString().slice(0,10) не сдвигает дату в UTC.
export function todayInputDate(): string {
	return toInputDate(new Date());
}

// Приводит дату из API к значению <input type="date"> в локальном времени.
export function dateToInputDate(iso: string): string {
	return toInputDate(new Date(iso));
}

function toInputDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

// Границы текущего месяца в локальном времени — для быстрых пресетов периода.
export function currentMonthRange(): { dateFrom: string; dateTo: string } {
	const now = new Date();
	return {
		dateFrom: toInputDate(new Date(now.getFullYear(), now.getMonth(), 1)),
		dateTo: toInputDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
	};
}
