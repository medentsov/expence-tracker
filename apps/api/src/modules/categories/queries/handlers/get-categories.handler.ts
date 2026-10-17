import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Category } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { GetCategoriesQuery } from '../get-categories.query';

@QueryHandler(GetCategoriesQuery)
export class GetCategoriesHandler implements IQueryHandler<GetCategoriesQuery, Category[]> {
  constructor(private readonly prisma: PrismaService) {}

  execute(query: GetCategoriesQuery): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { userId: query.userId },
      orderBy: { name: 'asc' },
    });
  }
}