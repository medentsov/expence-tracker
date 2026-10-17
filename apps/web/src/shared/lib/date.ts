// Локальная дата в формате YYYY-MM-DD для <input type="date">.
// В отличие от toISOString().slice(0,10) не сдвигает дату в UTC.
export function todayInputDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
