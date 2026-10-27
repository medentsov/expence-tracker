import { ApiProperty } from '@nestjs/swagger';

/**
 * Сводка доходов/расходов за месяц (`GET /transactions/summary`).
 *
 * Зеркалит интерфейс `TransactionsSummary` из `@tracker/shared`.
 */
export class TransactionsSummaryResponseDto {
	/** Месяц (1–12). */
	@ApiProperty({ example: 10 })
	month!: number;

	/** Год (≥ 2000). */
	@ApiProperty({ example: 2026 })
	year!: number;

	/** Общая сумма доходов за месяц (Decimal → number). */
	@ApiProperty({ example: 3000 })
	totalIncome!: number;

	/** Общая сумма расходов за месяц (Decimal → number). */
	@ApiProperty({ example: 4800 })
	totalExpense!: number;

	/** Баланс: доходы минус расходы. */
	@ApiProperty({ example: -1800 })
	balance!: number;
}
