import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Category } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { findOwnedCategory } from '../../category-ownership';
import { GetCategoryQuery } from '../get-category.query';

@QueryHandler(GetCategoryQuery)
export class GetCategoryHandler implements IQueryHandler<GetCategoryQuery, Category> {
  constructor(private readonly prisma: PrismaService) {}

  execute(query: GetCategoryQuery): Promise<Category> {
    return findOwnedCategory(this.prisma, query.userId, query.id);
  }
}