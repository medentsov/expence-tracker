import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

/**
 * Тело частичного обновления категории (`PATCH /categories/:id`).
 *
 * Наследует все поля `CreateCategoryDto` как опциональные (PATCH-семантика):
 * обновляются только переданные. Валидация — та же (`whitelist`,
 * `forbidNonWhitelisted`, class-validator).
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
