import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { Client, Invoice, UserProfile } from '@/types/finance';
import { formatCurrency } from '@/utils/currency';

export async function shareInvoicePdf({
  invoice,
  client,
  profile,
}: {
  invoice: Invoice;
  client?: Client;
  profile: UserProfile;
}) {
  const html = buildInvoiceHtml({ invoice, client, profile });
  const result = await Print.printToFileAsync({
    html,
    base64: false,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(result.uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Share ${invoice.invoiceNumber}`,
      UTI: 'com.adobe.pdf',
    });
  }

  return result.uri;
}

function buildInvoiceHtml({
  invoice,
  client,
  profile,
}: {
  invoice: Invoice;
  client?: Client;
  profile: UserProfile;
}) {
  const rows = invoice.lineItems
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.description)}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.rate, invoice.currency)}</td>
          <td>${formatCurrency(item.amount, invoice.currency)}</td>
        </tr>
      `,
    )
    .join('');

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { color: #101113; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 36px; }
          .top { align-items: flex-start; display: flex; justify-content: space-between; margin-bottom: 36px; }
          .eyebrow { color: #777C82; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
          h1 { font-size: 36px; margin: 8px 0 0; }
          .amount { color: #2563EB; font-size: 34px; font-weight: 900; text-align: right; }
          .card { border: 1px solid #ECEEF2; border-radius: 14px; margin-bottom: 22px; padding: 18px; }
          .grid { display: grid; gap: 14px; grid-template-columns: 1fr 1fr; }
          .label { color: #777C82; font-size: 12px; font-weight: 800; text-transform: uppercase; }
          .value { font-size: 16px; font-weight: 800; margin-top: 5px; }
          table { border-collapse: collapse; width: 100%; }
          th { color: #777C82; font-size: 12px; text-align: left; text-transform: uppercase; }
          th, td { border-bottom: 1px solid #ECEEF2; padding: 13px 8px; }
          td { font-size: 14px; font-weight: 700; }
          .footer { color: #777C82; font-size: 12px; margin-top: 28px; }
        </style>
      </head>
      <body>
        <section class="top">
          <div>
            <div class="eyebrow">Invoice</div>
            <h1>${escapeHtml(invoice.invoiceNumber)}</h1>
            <p>${escapeHtml(invoice.title)}</p>
          </div>
          <div class="amount">${formatCurrency(invoice.amount, invoice.currency)}</div>
        </section>

        <section class="card grid">
          <div>
            <div class="label">From</div>
            <div class="value">${escapeHtml(profile.name)}</div>
            <div>${escapeHtml(profile.email)}</div>
          </div>
          <div>
            <div class="label">Bill to</div>
            <div class="value">${escapeHtml(client?.name ?? 'Client')}</div>
            <div>${escapeHtml(client?.email ?? '')}</div>
          </div>
          <div>
            <div class="label">Issue date</div>
            <div class="value">${escapeHtml(invoice.issueDate)}</div>
          </div>
          <div>
            <div class="label">Due date</div>
            <div class="value">${escapeHtml(invoice.dueDate)}</div>
          </div>
        </section>

        <section class="card">
          <table>
            <thead>
              <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Total</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </section>

        <section class="card">
          <div class="label">Notes</div>
          <div class="value">${escapeHtml(invoice.notes || 'Thank you for your business.')}</div>
        </section>

        <p class="footer">Generated from SoloFlow Mobile.</p>
      </body>
    </html>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
