import type { Client, CurrencyCode, Invoice, Transaction, UserProfile } from '@/types/finance';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export function buildMonthlyCsvReport({
  profile,
  transactions,
  invoices,
  clients,
}: {
  profile: UserProfile;
  transactions: Transaction[];
  invoices: Invoice[];
  clients: Client[];
}) {
  const month = getLatestMonth(transactions);
  const rows = [
    ['type', 'title', 'amount', 'currency', 'category', 'client', 'invoice', 'date', 'status'],
    ...transactions
      .filter((transaction) => transaction.date.startsWith(month))
      .map((transaction) => [
        transaction.type,
        transaction.title,
        String(transaction.amount),
        transaction.currency,
        transaction.category,
        clients.find((client) => client.id === transaction.clientId)?.name ?? '',
        invoices.find((invoice) => invoice.id === transaction.invoiceId)?.invoiceNumber ?? '',
        transaction.date,
        transaction.status,
      ]),
  ];

  return {
    filename: `soloflow-${month}-report.csv`,
    month,
    csv: rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n'),
  };
}

export async function shareMonthlyCsvReport({
  profile,
  transactions,
  invoices,
  clients,
}: {
  profile: UserProfile;
  transactions: Transaction[];
  invoices: Invoice[];
  clients: Client[];
}) {
  const report = buildMonthlyCsvReport({ profile, transactions, invoices, clients });
  const fileUri = `${FileSystem.cacheDirectory}${report.filename}`;

  await FileSystem.writeAsStringAsync(fileUri, report.csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Share monthly CSV report',
      UTI: 'public.comma-separated-values-text',
    });
  }

  return report;
}

export function calculateTaxEstimate(transactions: Transaction[], currency: CurrencyCode) {
  const paidIncome = transactions
    .filter((transaction) => transaction.type === 'income' && transaction.status === 'paid')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const deductibleExpenses = transactions
    .filter((transaction) => transaction.type === 'expense' && transaction.status === 'paid')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const taxableProfit = Math.max(0, paidIncome - deductibleExpenses);
  const estimatedTax = Math.round(taxableProfit * 0.22);

  return {
    currency,
    paidIncome,
    deductibleExpenses,
    taxableProfit,
    estimatedTax,
    rate: 22,
  };
}

function escapeCsvCell(value: string) {
  const escaped = value.replace(/"/g, '""');

  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

function getLatestMonth(transactions: Transaction[]) {
  return [...transactions].sort((a, b) => b.date.localeCompare(a.date))[0]?.date.slice(0, 7) ?? new Date().toISOString().slice(0, 7);
}
