import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mockClients, mockGoals, mockInvoices, mockProfile, mockTransactions } from '@/data/mockData';
import { pullSnapshotFromCloud, pushSnapshotToCloud } from '@/services/cloudSync';
import { shareMonthlyCsvReport } from '@/services/reportExport';
import type { AppPreferences, Client, Goal, Invoice, PaymentReminder, SyncStatus, Transaction } from '@/types/finance';
import { calculateClientSummaries, calculateDashboard, calculateInsights, syncGoalProgress } from '@/utils/calculations';

const defaultPreferences: AppPreferences = {
  paymentReminders: true,
  darkModePreview: false,
  autoCloudBackup: true,
};

const defaultSyncStatus: SyncStatus = {
  mode: 'local',
  message: 'Local-first mode. Connect a cloud account to enable backup.',
  syncing: false,
};

type SoloFlowState = {
  hasHydrated: boolean;
  profile: typeof mockProfile;
  clients: typeof mockClients;
  invoices: Invoice[];
  transactions: Transaction[];
  goals: Goal[];
  reminders: PaymentReminder[];
  preferences: AppPreferences;
  syncStatus: SyncStatus;
  addClient: (client: Omit<Client, 'id' | 'avatar' | 'createdAt'>) => void;
  updateClient: (clientId: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'amount' | 'lineItems' | 'createdAt'> & { amount: number; service: string }) => void;
  updateInvoice: (invoiceId: string, updates: Partial<Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (transactionId: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  deleteTransaction: (transactionId: string) => void;
  updateGoalTarget: (goalId: string, targetAmount: number) => void;
  updateProfile: (profileUpdates: Partial<typeof mockProfile>) => void;
  completeOnboarding: (profileUpdates: Partial<typeof mockProfile>) => void;
  markInvoicePaid: (invoiceId: string) => void;
  updatePreferences: (updates: Partial<AppPreferences>) => void;
  prepareMonthlyReport: () => void;
  shareCsvReport: () => Promise<string>;
  queueInvoiceReminder: (invoiceId: string) => void;
  markReminderSent: (reminderId: string) => void;
  deleteReminder: (reminderId: string) => void;
  generateRecurringMonth: (template?: {
    incomeTitle: string;
    incomeAmount: number;
    expenseTitle: string;
    expenseAmount: number;
  }) => void;
  syncToCloud: () => Promise<void>;
  restoreFromCloud: () => Promise<void>;
  resetDemoData: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const useSoloFlowStore = create<SoloFlowState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      profile: mockProfile,
      clients: mockClients,
      invoices: mockInvoices,
      transactions: mockTransactions,
      goals: mockGoals,
      reminders: [],
      preferences: defaultPreferences,
      syncStatus: defaultSyncStatus,
      addClient: (client) =>
        set((state) => {
          const initials = client.name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

          return {
            clients: [
              {
                ...client,
                id: `client-${Date.now()}`,
                avatar: initials || 'CL',
                createdAt: new Date().toISOString(),
              },
              ...state.clients,
            ],
          };
        }),
      updateClient: (clientId, updates) =>
        set((state) => ({
          clients: state.clients.map((client) => (client.id === clientId ? { ...client, ...updates } : client)),
        })),
      addInvoice: (invoice) =>
        set((state) => {
          const timestamp = new Date().toISOString();
          const nextNumber = 1043 + state.invoices.filter((item) => item.id.startsWith('invoice-new')).length;
          const nextInvoice: Invoice = {
            ...invoice,
            id: `invoice-new-${Date.now()}`,
            invoiceNumber: `INV-${nextNumber}`,
            amount: invoice.amount,
            lineItems: [
              {
                id: `line-new-${Date.now()}`,
                description: invoice.service,
                quantity: 1,
                rate: invoice.amount,
                amount: invoice.amount,
              },
            ],
            createdAt: timestamp,
          };

          return {
            invoices: [nextInvoice, ...state.invoices],
          };
        }),
      updateInvoice: (invoiceId, updates) =>
        set((state) => {
          const timestamp = new Date().toISOString();
          const previousInvoice = state.invoices.find((invoice) => invoice.id === invoiceId);
          const paidDate =
            updates.status === 'paid' && !updates.paidDate ? new Date().toISOString().slice(0, 10) : updates.paidDate;
          const invoices = state.invoices.map((invoice) =>
            invoice.id === invoiceId ? { ...invoice, ...updates, ...(paidDate ? { paidDate } : {}) } : invoice,
          );
          const updatedInvoice = invoices.find((invoice) => invoice.id === invoiceId);
          const shouldCreatePaidTransaction =
            previousInvoice?.status !== 'paid' &&
            updatedInvoice?.status === 'paid' &&
            !state.transactions.some((transaction) => transaction.invoiceId === invoiceId);
          const nextTransactions =
            updatedInvoice && shouldCreatePaidTransaction
              ? [createPaidInvoiceTransaction(updatedInvoice, paidDate ?? new Date().toISOString().slice(0, 10), timestamp), ...state.transactions]
              : state.transactions;

          return {
            invoices,
            transactions: nextTransactions,
            reminders: state.reminders.filter((reminder) => reminder.invoiceId !== invoiceId),
            goals: syncGoalProgress(state.goals, state.profile, nextTransactions),
          };
        }),
      addTransaction: (transaction) =>
        set((state) => {
          const timestamp = new Date().toISOString();
          const nextTransactions = [
            {
              ...transaction,
              id: `txn-${Date.now()}`,
              createdAt: timestamp,
              updatedAt: timestamp,
            },
            ...state.transactions,
          ];

          return {
            transactions: nextTransactions,
            goals: syncGoalProgress(state.goals, state.profile, nextTransactions),
          };
        }),
      updateTransaction: (transactionId, updates) =>
        set((state) => {
          const timestamp = new Date().toISOString();
          const nextTransactions = state.transactions.map((transaction) =>
            transaction.id === transactionId
              ? {
                  ...transaction,
                  ...updates,
                  updatedAt: timestamp,
                }
              : transaction,
          );

          return {
            transactions: nextTransactions,
            goals: syncGoalProgress(state.goals, state.profile, nextTransactions),
          };
        }),
      deleteTransaction: (transactionId) =>
        set((state) => {
          const nextTransactions = state.transactions.filter((transaction) => transaction.id !== transactionId);

          return {
            transactions: nextTransactions,
            goals: syncGoalProgress(state.goals, state.profile, nextTransactions),
          };
        }),
      updateGoalTarget: (goalId, targetAmount) =>
        set((state) => {
          const safeTarget = Math.max(1, Math.round(targetAmount));
          const targetGoal = state.goals.find((goal) => goal.id === goalId);
          const nextProfile = targetGoal
            ? {
                ...state.profile,
                ...(targetGoal.type === 'revenue' ? { monthlyRevenueGoal: safeTarget } : {}),
                ...(targetGoal.type === 'savings' ? { savingsGoal: safeTarget } : {}),
                ...(targetGoal.type === 'expense_limit' ? { expenseLimit: safeTarget } : {}),
              }
            : state.profile;
          const nextGoals = state.goals.map((goal) =>
            goal.id === goalId ? { ...goal, targetAmount: safeTarget } : goal,
          );

          return {
            profile: nextProfile,
            goals: syncGoalProgress(nextGoals, nextProfile, state.transactions),
          };
        }),
      updateProfile: (profileUpdates) =>
        set((state) => {
          const nextProfile = {
            ...state.profile,
            ...profileUpdates,
          };

          return {
            profile: nextProfile,
            goals: syncGoalProgress(state.goals, nextProfile, state.transactions),
          };
        }),
      completeOnboarding: (profileUpdates) =>
        set((state) => {
          const nextProfile = {
            ...state.profile,
            ...profileUpdates,
            onboardingCompleted: true,
          };
          const nextGoals = syncGoalTargetsWithProfile(state.goals, nextProfile);

          return {
            profile: nextProfile,
            goals: syncGoalProgress(nextGoals, nextProfile, state.transactions),
          };
        }),
      markInvoicePaid: (invoiceId) =>
        set((state) => {
          const paidDate = new Date().toISOString().slice(0, 10);
          const timestamp = new Date().toISOString();
          const paidInvoice = state.invoices.find((invoice) => invoice.id === invoiceId);
          const invoices = state.invoices.map((invoice) =>
            invoice.id === invoiceId ? { ...invoice, status: 'paid' as const, paidDate } : invoice,
          );
          const alreadyLinked = state.transactions.some((transaction) => transaction.invoiceId === invoiceId);
          const nextTransactions =
            paidInvoice && !alreadyLinked
              ? [
                  createPaidInvoiceTransaction(paidInvoice, paidDate, timestamp),
                  ...state.transactions,
                ]
              : state.transactions;

          return {
            invoices,
            transactions: nextTransactions,
            reminders: state.reminders.filter((reminder) => reminder.invoiceId !== invoiceId),
            goals: syncGoalProgress(state.goals, state.profile, nextTransactions),
          };
        }),
      updatePreferences: (updates) =>
        set((state) => ({
          preferences: {
            ...defaultPreferences,
            ...state.preferences,
            ...updates,
          },
        })),
      prepareMonthlyReport: () =>
        set((state) => {
          const dashboard = calculateDashboard(state.profile, state.transactions, state.invoices);
          const summary = `${dashboard.month} report prepared: ${state.profile.currency} ${dashboard.income.toLocaleString()} income, ${state.profile.currency} ${dashboard.expenses.toLocaleString()} expenses, ${state.profile.currency} ${dashboard.profit.toLocaleString()} net profit.`;

          return {
            preferences: {
              ...defaultPreferences,
              ...state.preferences,
              lastReportSummary: summary,
            },
          };
        }),
      shareCsvReport: async () => {
        const state = useSoloFlowStore.getState();
        const report = await shareMonthlyCsvReport({
          profile: state.profile,
          transactions: state.transactions,
          invoices: state.invoices,
          clients: state.clients,
        });

        set((currentState) => ({
          preferences: {
            ...defaultPreferences,
            ...currentState.preferences,
            lastCsvReport: report.filename,
          },
        }));

        return report.csv;
      },
      queueInvoiceReminder: (invoiceId) =>
        set((state) => {
          const invoice = state.invoices.find((item) => item.id === invoiceId);

          if (!invoice) {
            return {};
          }

          const client = state.clients.find((item) => item.id === invoice.clientId);
          const reminderExists = state.reminders.some((reminder) => reminder.invoiceId === invoiceId && reminder.status === 'queued');

          if (reminderExists) {
            return {};
          }

          return {
            reminders: [
              {
                id: `reminder-${invoiceId}-${Date.now()}`,
                invoiceId,
                clientId: invoice.clientId,
                invoiceNumber: invoice.invoiceNumber,
                clientName: client?.name ?? 'Unknown client',
                amount: invoice.amount,
                currency: invoice.currency,
                dueDate: invoice.dueDate,
                queuedAt: new Date().toISOString(),
                status: 'queued',
              },
              ...state.reminders,
            ],
          };
        }),
      markReminderSent: (reminderId) =>
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === reminderId
              ? {
                  ...reminder,
                  status: 'sent',
                  sentAt: new Date().toISOString(),
                }
              : reminder,
          ),
        })),
      deleteReminder: (reminderId) =>
        set((state) => ({
          reminders: state.reminders.filter((reminder) => reminder.id !== reminderId),
        })),
      generateRecurringMonth: (template) =>
        set((state) => {
          const month = new Date().toISOString().slice(0, 7);
          const hasRecurring = state.transactions.some((transaction) => transaction.id.startsWith(`recurring-${month}`));
          const incomeTitle = template?.incomeTitle.trim() || 'Monthly retainer income';
          const expenseTitle = template?.expenseTitle.trim() || 'Monthly software tools';
          const incomeAmount = Math.max(1, Math.round(template?.incomeAmount ?? 1200));
          const expenseAmount = Math.max(1, Math.round(template?.expenseAmount ?? 160));

          if (hasRecurring) {
            return {
              preferences: {
                ...defaultPreferences,
                ...state.preferences,
                lastReportSummary: 'Recurring items for this month already exist.',
              },
            };
          }

          const timestamp = new Date().toISOString();
          const nextTransactions: Transaction[] = [
            {
              id: `recurring-${month}-retainer`,
              title: incomeTitle,
              type: 'income',
              amount: incomeAmount,
              currency: state.profile.currency,
              category: 'Retainer',
              clientId: state.clients[0]?.id,
              date: `${month}-01`,
              status: 'pending',
              notes: 'Generated from recurring monthly setup.',
              createdAt: timestamp,
              updatedAt: timestamp,
            },
            {
              id: `recurring-${month}-software`,
              title: expenseTitle,
              type: 'expense',
              amount: expenseAmount,
              currency: state.profile.currency,
              category: 'Software',
              date: `${month}-02`,
              status: 'pending',
              notes: 'Generated from recurring monthly setup.',
              createdAt: timestamp,
              updatedAt: timestamp,
            },
            ...state.transactions,
          ];

          return {
            transactions: nextTransactions,
            goals: syncGoalProgress(state.goals, state.profile, nextTransactions),
            preferences: {
              ...defaultPreferences,
              ...state.preferences,
              lastReportSummary: 'Recurring items generated for this month.',
            },
          };
        }),
      syncToCloud: async () => {
        await backupCurrentState('manual');
      },
      restoreFromCloud: async () => {
        set((state) => ({
          syncStatus: {
            ...state.syncStatus,
            syncing: true,
            message: 'Checking cloud backup...',
          },
        }));

        const result = await pullSnapshotFromCloud();

        if (result.ok && result.snapshot) {
          suppressNextAutoBackup = true;
          set({
            profile: result.snapshot.profile,
            clients: result.snapshot.clients,
            invoices: result.snapshot.invoices,
            transactions: result.snapshot.transactions,
            goals: result.snapshot.goals,
            reminders: result.snapshot.reminders,
            preferences: {
              ...defaultPreferences,
              ...result.snapshot.preferences,
            },
            syncStatus: {
              mode: result.mode,
              message: result.message,
              lastSyncedAt: result.snapshot.updatedAt,
              syncing: false,
            },
          });
          return;
        }

        set({
          syncStatus: {
            mode: result.mode === 'error' ? 'error' : result.mode,
            message: result.message,
            lastSyncedAt: result.syncedAt,
            syncing: false,
          },
        });
      },
      resetDemoData: () =>
        set({
          profile: { ...mockProfile, onboardingCompleted: true },
          clients: mockClients,
          invoices: mockInvoices,
          transactions: mockTransactions,
          goals: mockGoals,
          reminders: [],
          preferences: defaultPreferences,
          syncStatus: defaultSyncStatus,
        }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'soloflow-demo-store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.preferences = {
            ...defaultPreferences,
            ...state.preferences,
          };
          state.syncStatus = {
            ...defaultSyncStatus,
            ...state.syncStatus,
            syncing: false,
          };
          state.reminders = state.reminders ?? [];
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);

let autoBackupTimer: ReturnType<typeof setTimeout> | undefined;
let suppressNextAutoBackup = false;

useSoloFlowStore.subscribe((state, previousState) => {
  const changedFinanceData =
    state.profile !== previousState.profile ||
    state.clients !== previousState.clients ||
    state.invoices !== previousState.invoices ||
    state.transactions !== previousState.transactions ||
    state.goals !== previousState.goals ||
    state.reminders !== previousState.reminders;

  if (!changedFinanceData) {
    return;
  }

  if (suppressNextAutoBackup) {
    suppressNextAutoBackup = false;
    return;
  }

  if (!state.hasHydrated || !state.preferences.autoCloudBackup || state.syncStatus.mode !== 'cloud') {
    return;
  }

  if (autoBackupTimer) {
    clearTimeout(autoBackupTimer);
  }

  autoBackupTimer = setTimeout(() => {
    backupCurrentState('auto');
  }, 1600);
});

async function backupCurrentState(source: 'manual' | 'auto') {
  const state = useSoloFlowStore.getState();

  if (state.syncStatus.syncing) {
    return;
  }

  useSoloFlowStore.setState({
    syncStatus: {
      ...state.syncStatus,
      syncing: true,
      message: source === 'auto' ? 'Auto backup running...' : 'Preparing backup...',
    },
  });

  const snapshot = useSoloFlowStore.getState();
  const result = await pushSnapshotToCloud({
    profile: snapshot.profile,
    clients: snapshot.clients,
    invoices: snapshot.invoices,
    transactions: snapshot.transactions,
    goals: snapshot.goals,
    reminders: snapshot.reminders,
    preferences: snapshot.preferences,
  });

  useSoloFlowStore.setState({
    syncStatus: {
      mode: result.mode === 'error' ? 'error' : result.mode,
      message: source === 'auto' && result.mode === 'cloud' ? 'Auto backup completed.' : result.message,
      lastSyncedAt: result.syncedAt,
      syncing: false,
    },
  });
}

function createPaidInvoiceTransaction(invoice: Invoice, paidDate: string, timestamp: string): Transaction {
  return {
    id: `txn-invoice-${invoice.id}-${Date.now()}`,
    title: `${invoice.invoiceNumber} payment`,
    type: 'income',
    amount: invoice.amount,
    currency: invoice.currency,
    category: 'Project payment',
    clientId: invoice.clientId,
    invoiceId: invoice.id,
    date: paidDate,
    status: 'paid',
    notes: `Auto-created when ${invoice.invoiceNumber} was marked paid.`,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function syncGoalTargetsWithProfile(goals: Goal[], profile: typeof mockProfile) {
  return goals.map((goal) => {
    if (goal.type === 'revenue') {
      return { ...goal, targetAmount: profile.monthlyRevenueGoal };
    }

    if (goal.type === 'savings') {
      return { ...goal, targetAmount: profile.savingsGoal };
    }

    return { ...goal, targetAmount: profile.expenseLimit };
  });
}

export function useDashboardSummary() {
  const profile = useSoloFlowStore((state) => state.profile);
  const transactions = useSoloFlowStore((state) => state.transactions);
  const invoices = useSoloFlowStore((state) => state.invoices);

  return useMemo(() => calculateDashboard(profile, transactions, invoices), [invoices, profile, transactions]);
}

export function useClientSummaries() {
  const clients = useSoloFlowStore((state) => state.clients);
  const invoices = useSoloFlowStore((state) => state.invoices);

  return useMemo(() => calculateClientSummaries(clients, invoices), [clients, invoices]);
}

export function useInsightsSummary() {
  const transactions = useSoloFlowStore((state) => state.transactions);
  const invoices = useSoloFlowStore((state) => state.invoices);
  const clients = useSoloFlowStore((state) => state.clients);

  return useMemo(() => calculateInsights(transactions, invoices, clients), [clients, invoices, transactions]);
}
