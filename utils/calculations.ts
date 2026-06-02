import type {
  Client,
  ClientSummary,
  Goal,
  InsightSummary,
  Invoice,
  Transaction,
  UserProfile,
} from '@/types/finance';
import { getMonthKey } from '@/utils/date';

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

export function calculateDashboard(profile: UserProfile, transactions: Transaction[], invoices: Invoice[]) {
  const latestMonth = getLatestMonth(transactions);
  const monthlyTransactions = transactions.filter((transaction) => getMonthKey(transaction.date) === latestMonth);

  const income = sumBy(
    monthlyTransactions.filter((transaction) => transaction.type === 'income' && transaction.status === 'paid'),
    'amount',
  );
  const expenses = sumBy(
    monthlyTransactions.filter((transaction) => transaction.type === 'expense' && transaction.status === 'paid'),
    'amount',
  );
  const profit = income - expenses;
  const pendingPayments = sumBy(
    invoices.filter((invoice) => invoice.status === 'pending' || invoice.status === 'overdue'),
    'amount',
  );

  return {
    month: latestMonth,
    income,
    expenses,
    profit,
    pendingPayments,
    revenueProgress: clampPercent((income / profile.monthlyRevenueGoal) * 100),
    savingsProgress: clampPercent((profit / profile.savingsGoal) * 100),
    expenseUsage: clampPercent((expenses / profile.expenseLimit) * 100),
  };
}

export function calculateClientSummaries(clients: Client[], invoices: Invoice[]): ClientSummary[] {
  return clients.map((client) => {
    const clientInvoices = invoices.filter((invoice) => invoice.clientId === client.id);
    const paidInvoices = clientInvoices.filter((invoice) => invoice.status === 'paid');
    const unpaidInvoices = clientInvoices.filter(
      (invoice) => invoice.status === 'pending' || invoice.status === 'overdue',
    );

    return {
      ...client,
      totalBilled: sumBy(clientInvoices, 'amount'),
      totalPaid: sumBy(paidInvoices, 'amount'),
      unpaidAmount: sumBy(unpaidInvoices, 'amount'),
      lastPaymentDate: paidInvoices
        .map((invoice) => invoice.paidDate)
        .filter(Boolean)
        .sort()
        .at(-1),
    };
  });
}

export function calculateInsights(
  transactions: Transaction[],
  invoices: Invoice[],
  clients: Client[],
): InsightSummary {
  const paidIncome = transactions.filter((transaction) => transaction.type === 'income' && transaction.status === 'paid');
  const paidExpenses = transactions.filter(
    (transaction) => transaction.type === 'expense' && transaction.status === 'paid',
  );
  const income = sumBy(paidIncome, 'amount');
  const expenses = sumBy(paidExpenses, 'amount');
  const profit = income - expenses;

  const clientRevenue = new Map<string, number>();
  paidIncome.forEach((transaction) => {
    if (!transaction.clientId) {
      return;
    }

    clientRevenue.set(transaction.clientId, (clientRevenue.get(transaction.clientId) ?? 0) + transaction.amount);
  });

  const [topClientId, topClientRevenue = 0] = [...clientRevenue.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
  const topClientName = clients.find((client) => client.id === topClientId)?.name ?? 'No client yet';

  const expenseCategoryTotals = new Map<string, number>();
  paidExpenses.forEach((transaction) => {
    expenseCategoryTotals.set(
      transaction.category,
      (expenseCategoryTotals.get(transaction.category) ?? 0) + transaction.amount,
    );
  });

  const highestExpenseCategory = [...expenseCategoryTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'None';

  return {
    income,
    expenses,
    profit,
    pendingAmount: sumBy(
      invoices.filter((invoice) => invoice.status === 'pending'),
      'amount',
    ),
    overdueAmount: sumBy(
      invoices.filter((invoice) => invoice.status === 'overdue'),
      'amount',
    ),
    savingsRate: income > 0 ? Math.round((profit / income) * 100) : 0,
    topClientName,
    topClientRevenue,
    bestMonth: 'May 2026',
    highestExpenseCategory,
  };
}

export function syncGoalProgress(goals: Goal[], profile: UserProfile, transactions: Transaction[]) {
  const dashboard = calculateDashboard(profile, transactions, []);

  return goals.map((goal) => {
    if (goal.type === 'revenue') {
      return { ...goal, currentAmount: dashboard.income };
    }

    if (goal.type === 'savings') {
      return { ...goal, currentAmount: dashboard.profit };
    }

    return { ...goal, currentAmount: dashboard.expenses };
  });
}

function getLatestMonth(transactions: Transaction[]) {
  return [...transactions].sort((a, b) => b.date.localeCompare(a.date))[0]?.date.slice(0, 7) ?? getMonthKey(new Date().toISOString());
}

function sumBy<T extends Record<string, unknown>>(items: T[], key: keyof T) {
  return items.reduce((sum, item) => sum + Number(item[key] ?? 0), 0);
}
