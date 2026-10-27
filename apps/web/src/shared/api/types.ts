// Формат тела ошибки NestJS (class-validator / HttpException).
export interface ApiErrorBody {
	statusCode: number;
	// class-validator отдаёт массив строк, прочие исключения — одну строку.
	message: string | string[];
	error?: string;
}

// Приводит message из тела ошибки к одной читаемой строке.
export function extractMessage(body: unknown): string {
	if (!body || typeof body !== 'object') {
		return 'Неизвестная ошибка';
	}

	const message = (body as ApiErrorBody).message;
	if (Array.isArray(message)) {
		return message.join('; ');
	}
	if (typeof message === 'string' && message.length > 0) {
		return message;
	}
	return 'Неизвестная ошибка';
}
