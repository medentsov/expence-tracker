import { PartialType } from '@nestjs/swagger';
import { CreateTransactionDto } from './create-transaction.dto';

/**
 * Тело частичного обновления транзакции (`PATCH /transactions/:id`).
 *
 * Наследует все поля `CreateTransactionDto` как опциональные (PATCH-семантика):
 * обновляются только переданные. Валидация — та же (`whitelist`,
 * `forbidNonWhitelisted`, class-validator).
 *
 * @remarks `PartialType` из `@nestjs/swagger` генерирует опциональные поля и
 *          корректно описывает их в Swagger.
 */
export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
