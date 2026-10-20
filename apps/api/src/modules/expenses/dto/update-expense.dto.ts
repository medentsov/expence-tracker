import { PartialType } from '@nestjs/swagger';
import { CreateExpenseDto } from './create-expense.dto';

/**
 * Тело частичного обновления расхода (`PATCH /expenses/:id`).
 *
 * Наследует все поля `CreateExpenseDto` как опциональные (PATCH-семантика):
 * обновляются только переданные. Валидация — та же (`whitelist`,
 * `forbidNonWhitelisted`, class-validator).
 */
export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}
