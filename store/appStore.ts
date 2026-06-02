import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mockClients, mockGoals, mockInvoices, mockProfile, mockTransactions } from '@/data/mockData';
import type { Client, Goal, Invoice, Transaction } from '@/types/finance';
import { calculateClientSummaries, calculateDashboard, calculateInsights, syncGoalProgress } from '@/utils/calculations';

type SoloFlowState = {
  hasHydrated: boolean;
  profile: typeof mockProfile;
  clients: typeof mockClients;
  invoices: Invoice[];
  transactions: Transaction[];
  goals: Goal[];
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
            goals: syncGoalProgress(state.goals, state.profile, nextTransactions),
          };
        }),
      resetDemoData: () =>
        set({
          profile: { ...mockProfile, onboardingCompleted: true },
          clients: mockClients,
          invoices: mockInvoices,
          transactions: mockTransactions,
          goals: mockGoals,
        }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'soloflow-demo-store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

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
