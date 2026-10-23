import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service';
import { findOwnedTransaction } from './transaction-ownership';

describe('findOwnedTransaction', () => {
  const findUnique = jest.fn();
  const prisma = { transaction: { findUnique } } as unknown as PrismaService;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('возвращает свою транзакцию с категорией', async () => {
    const row = { id: '1', userId: 'u1', category: { id: 'c1' } };
    findUnique.mockResolvedValue(row);

    await expect(findOwnedTransaction(prisma, 'u1', '1')).resolves.toEqual(row);
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: { category: true },
    });
  });

  it('бросает NotFoundException на чужую транзакцию', async () => {
    findUnique.mockResolvedValue({ id: '1', userId: 'someone-else' });

    await expect(findOwnedTransaction(prisma, 'u1', '1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
