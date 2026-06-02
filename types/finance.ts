export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP';

export type UserRole =
  | 'freelancer'
  | 'creator'
  | 'consultant'
  | 'solo-founder'
  | 'agency-owner';

export type TransactionType = 'income' | 'expense';

export type MoneyStatus = 'paid' | 'pending' | 'overdue' | 'draft' | 'cancelled';

export type GoalType = 'revenue' | 'savings' | 'expense_limit';

export type GoalStatus = 'on_track' | 'behind' | 'completed' | 'not_started';

export type ClientStatus = 'active' | 'waiting_payment' | 'past_client' | 'prospect';

export type UserProfile = {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  currency: CurrencyCode;
  businessType: string;
  monthlyRevenueGoal: number;
  savingsGoal: number;
  expenseLimit: number;
  trackingPreferences: string[];
  onboardingCompleted: boolean;
  createdAt: string;
};

export type Transaction = {
  id: string;
  title: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  category: string;
  clientId?: string;
  invoiceId?: string;
  date: string;
  status: MoneyStatus;
  notes?: string;
  attachmentName?: string;
  createdAt: string;
  updatedAt: string;
};

export type Client = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  avatar: string;
  category: string;
  status: ClientStatus;
  createdAt: string;
};

export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type Invoice = {
  id: string;
  clientId: string;
  invoiceNumber: string;
  title: string;
  amount: number;
  currency: CurrencyCode;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  status: MoneyStatus;
  lineItems: InvoiceLineItem[];
  notes?: string;
  createdAt: string;
};

export type Goal = {
  id: string;
  type: GoalType;
  title: string;
  targetAmount: number;
  currentAmount: number;
  month: string;
  status: GoalStatus;
  createdAt: string;
};

export type ClientSummary = Client & {
  totalBilled: number;
  totalPaid: number;
  unpaidAmount: number;
  lastPaymentDate?: string;
};

export type InsightSummary = {
  income: number;
  expenses: number;
  profit: number;
  pendingAmount: number;
  overdueAmount: number;
  savingsRate: number;
  topClientName: string;
  topClientRevenue: number;
  bestMonth: string;
  highestExpenseCategory: string;
};

export type AppPreferences = {
  paymentReminders: boolean;
  darkModePreview: boolean;
  lastReportSummary?: string;
};

export type SyncMode = 'local' | 'cloud' | 'error';

export type SyncStatus = {
  mode: SyncMode;
  message: string;
  lastSyncedAt?: string;
  syncing: boolean;
};
