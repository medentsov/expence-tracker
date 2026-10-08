import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Продукты', description: 'Название категории' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ required: false, example: '🛒', description: 'Эмодзи-иконка' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  icon?: string;
}