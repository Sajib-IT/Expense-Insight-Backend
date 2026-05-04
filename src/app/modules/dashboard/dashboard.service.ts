import prisma from '../../../shared/prisma';

const getSummary = async (userId: string, month?: number, year?: number) => {
  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();

  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

  // Total income and expenses for the period
  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.expense.aggregate({
      where: {
        userId,
        type: 'INCOME',
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.expense.aggregate({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const totalIncome = incomeAgg._sum.amount || 0;
  const totalExpenses = expenseAgg._sum.amount || 0;
  const balance = totalIncome - totalExpenses;

  // Expenses grouped by category
  const expensesByCategory = await prisma.expense.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      type: 'EXPENSE',
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
    _count: true,
    orderBy: { _sum: { amount: 'desc' } },
  });

  // Fetch category details
  const categoryIds = expensesByCategory.map((e) => e.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
  });

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const categoryBreakdown = expensesByCategory.map((item) => {
    const category = categoryMap.get(item.categoryId);
    return {
      categoryId: item.categoryId,
      categoryName: category?.name || 'Unknown',
      categoryColour: category?.colour,
      categoryIcon: category?.icon,
      total: item._sum.amount || 0,
      count: item._count,
      percentage: totalExpenses > 0
        ? Math.round(((item._sum.amount || 0) / totalExpenses) * 100)
        : 0,
    };
  });

  // Recent transactions
  const recentTransactions = await prisma.expense.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { date: 'desc' },
    take: 10,
  });

  // Budget overview
  const budgets = await prisma.budget.findMany({
    where: { userId, month: targetMonth, year: targetYear },
    include: { category: true },
  });

  const budgetOverview = await Promise.all(
    budgets.map(async (budget) => {
      const spent = await prisma.expense.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: 'EXPENSE',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      });

      const spentAmount = spent._sum.amount || 0;

      return {
        id: budget.id,
        categoryName: budget.category.name,
        budgetAmount: budget.amount,
        spent: spentAmount,
        remaining: budget.amount - spentAmount,
        percentage: Math.min(Math.round((spentAmount / budget.amount) * 100), 100),
      };
    }),
  );

  return {
    period: { month: targetMonth, year: targetYear },
    summary: {
      totalIncome,
      totalExpenses,
      balance,
      transactionCount: (incomeAgg._count || 0) + (expenseAgg._count || 0),
    },
    categoryBreakdown,
    budgetOverview,
    recentTransactions,
  };
};

export const DashboardService = { getSummary };
