const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const requiredFiles = [
  'app/(tabs)/index.tsx',
  'app/(tabs)/transactions.tsx',
  'app/(tabs)/clients.tsx',
  'app/(tabs)/insights.tsx',
  'app/(tabs)/settings.tsx',
  'app/onboarding/index.tsx',
  'app/transaction/add.tsx',
  'app/transaction/[id].tsx',
  'app/client/[id].tsx',
  'app/invoices/index.tsx',
  'app/invoice/[id].tsx',
  'app/goals/index.tsx',
  'app/cloud-account/index.tsx',
  'app/reminders/index.tsx',
  'app/recurring/index.tsx',
  'app/profile/edit.tsx',
  'services/invoiceExport.ts',
  'services/attachmentPicker.ts',
  'services/reportExport.ts',
  'store/appStore.ts',
];

const forbiddenUserCopy = [
  'KMAX proof',
  'Preview onboarding',
  'Postgres',
  'database',
  'stack',
  'coming soon',
  'not available',
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const relativePath of requiredFiles) {
  assert(fs.existsSync(path.join(root, relativePath)), `Missing required file: ${relativePath}`);
}

const uiDirs = ['app', 'components'];
const uiSource = uiDirs
  .flatMap((dir) => walk(path.join(root, dir)))
  .filter((file) => /\.(tsx|ts)$/.test(file))
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n');

for (const phrase of forbiddenUserCopy) {
  assert(!uiSource.includes(phrase), `Forbidden user-facing copy found: ${phrase}`);
}

const storeSource = fs.readFileSync(path.join(root, 'store/appStore.ts'), 'utf8');
for (const action of ['shareCsvReport', 'queueInvoiceReminder', 'markReminderSent', 'generateRecurringMonth']) {
  assert(storeSource.includes(action), `Store action missing: ${action}`);
}

console.log('Portfolio smoke test passed.');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    return entry.isDirectory() ? walk(fullPath) : fullPath;
  });
}
