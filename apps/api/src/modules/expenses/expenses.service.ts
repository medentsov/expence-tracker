import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        amount: dto.amount,
        currency: dto.currency,
        note: dto.note,
        date: dto.date,
        categoryId: dto.categoryId,
      },
    });
  }

  findAll() {
    return this.prisma.expense.findMany({
      orderBy: { date: 'desc' },
      include: { category: true },
    });
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!expense) {
      throw new NotFoundException(`Расход ${id} не найден`);
    }
    return expense;
  }

  update(id: string, dto: UpdateExpenseDto) {
    return this.prisma.expense.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.expense.delete({ where: { id } });
  }
}