/**
 * Seed для локальной разработки и тестов (PostgreSQL через Prisma).
 *
 * Идемпотентный: пересоздаёт демо-пользователя, его категории и транзакции
 * (удаляет прежние данные именно этого seed-пользователя перед вставкой),
 * поэтому повторный запуск не плодит дубликаты.
 *
 * Креды демо-пользователя (для тестов и локального входа):
 *   email:    demo@tracker.local
 *   password: demo12345
 *
 * Запуск:
 *   npm run prisma:seed -w @tracker/api   # или: npx prisma db seed
 *
 * Данные: 4 категории + 10 транзакций (доходы/расходы за октябрь и сентябрь 2026).
 */

const bcrypt = require('bcryptjs');
const { PrismaClient, TransactionType } = require('@prisma/client');

const prisma = new PrismaClient();

// Совпадает с `RegisterHandler.BCRYPT_ROUNDS` (apps/api/src/modules/auth/commands/handlers/register.handler.ts).
const BCRYPT_ROUNDS = 10;

const DEMO_USER = {
  email: 'demo@tracker.local',
  password: 'demo12345',
  name: 'Демо Пользователь',
};

const CATEGORIES = [
  { name: 'Продукты', icon: '🛒', color: '#22c55e' },
  { name: 'Транспорт', icon: '🚌', color: '#3b82f6' },
  { name: 'Зарплата', icon: '💼', color: '#f59e0b' },
  { name: 'Развлечения', icon: '🎬', color: '#ec4899' },
];

// amount, type, description, date (ISO), categoryName
const TRANSACTIONS = [
  { amount: 150000, type: TransactionType.INCOME, description: 'Зарплата октябрь', date: '2026-10-05', category: 'Зарплата' },
  { amount: 3200.5, type: TransactionType.EXPENSE, description: 'Продукты неделя 1', date: '2026-10-06', category: 'Продукты' },
  { amount: 1200, type: TransactionType.EXPENSE, description: 'Проездной', date: '2026-10-07', category: 'Транспорт' },
  { amount: 4500, type: TransactionType.EXPENSE, description: 'Кино и ужин', date: '2026-10-08', category: 'Развлечения' },
  { amount: 2800.9, type: TransactionType.EXPENSE, description: 'Продукты неделя 2', date: '2026-10-12', category: 'Продукты' },
  { amount: 800, type: TransactionType.EXPENSE, description: 'Такси', date: '2026-10-15', category: 'Транспорт' },
  { amount: 6000, type: TransactionType.EXPENSE, description: 'Концерт', date: '2026-10-18', category: 'Развлечения' },
  { amount: 150000, type: TransactionType.INCOME, description: 'Зарплата сентябрь', date: '2026-09-05', category: 'Зарплата' },
  { amount: 5400, type: TransactionType.EXPENSE, description: 'Продукты за сентябрь', date: '2026-09-10', category: 'Продукты' },
  { amount: 1500, type: TransactionType.EXPENSE, description: 'Транспорт сентябрь', date: '2026-09-15', category: 'Транспорт' },
];

async function main() {
  // 1. Создать/обновить демо-пользователя (пароль в открытом виде сюда не попадает).
  const passwordHash = await bcrypt.hash(DEMO_USER.password, BCRYPT_ROUNDS);
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: { name: DEMO_USER.name, passwordHash },
    create: { email: DEMO_USER.email, name: DEMO_USER.name, passwordHash },
  });

  // 2. Очистить прежние данные именно этого пользователя (идемпотентность).
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.expense.deleteMany({ where: { userId: user.id } });
  await prisma.category.deleteMany({ where: { userId: user.id } });

  // 3. Категории и транзакции — одной транзакцией для атомарности.
  await prisma.$transaction(async (tx) => {
    const categoryIds = {};
    for (const cat of CATEGORIES) {
      const created = await tx.category.create({
        data: { ...cat, userId: user.id },
      });
      categoryIds[cat.name] = created.id;
    }

    for (const t of TRANSACTIONS) {
      await tx.transaction.create({
        data: {
          amount: t.amount,
          type: t.type,
          description: t.description,
          date: new Date(`${t.date}T00:00:00.000Z`),
          userId: user.id,
          categoryId: categoryIds[t.category],
        },
      });
    }
  });

  console.log(`Seed завершён: ${DEMO_USER.email} (id ${user.id})`);
  console.log(`  категорий: ${CATEGORIES.length}, транзакций: ${TRANSACTIONS.length}`);
}

main()
  .catch((e) => {
    console.error('Ошибка seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
