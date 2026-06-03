# SoloFlow Mobile Case Study

## Title

SoloFlow Mobile: Designing and building a mobile finance tracker for freelancers.

## Short Description

SoloFlow Mobile is a polished React Native app that helps freelancers, creators, consultants, and solo founders track income, expenses, clients, invoices, reminders, and monthly goals from one mobile-first finance workspace.

## Problem

Freelancers often manage business money across scattered invoices, notes, spreadsheets, and bank transfers. They need a fast answer to simple but important questions:

- How much did I earn this month?
- How much did I spend?
- Which clients still owe money?
- Am I on track for my monthly goal?
- Which clients and categories are shaping my cashflow?

Traditional accounting tools can feel too heavy for daily mobile use, while spreadsheets are slow and easy to forget.

## Solution

SoloFlow gives independent workers a focused mobile app for everyday money visibility:

- onboarding and setup preferences
- calculated monthly dashboard
- income and expense tracking
- transaction search and filters
- client money summaries
- invoice/payment tracking
- mark-as-paid invoice workflow
- invoice PDF sharing
- local attachment picker
- reminder queue
- recurring monthly setup
- CSV report sharing
- insights and chart-style summaries
- editable monthly goals
- cloud account backup and restore

## Role

- Product strategy
- Mobile UX design
- React Native development
- Data modeling
- Finance calculation logic
- App interaction design
- Local persistence architecture
- Cloud-ready V2 planning

## Product Highlights

- A thumb-friendly mobile dashboard that makes profit, pending payments, and goal progress easy to scan.
- Realistic client and invoice flows that show billed, paid, unpaid, overdue, draft, and cancelled states.
- Local state updates that keep dashboard, insights, and goals in sync after financial actions.
- Portfolio-ready V2 features including cloud backup, Google entry point, CSV export, invoice PDF export, reminders, and recurring setup.
- Clean business utility UI with soft gradients, compact cards, clear status badges, and responsive spacing.

## Key Screens

- Onboarding
- Home dashboard
- Money activity
- Add/edit transaction
- Transaction detail
- Clients
- Client detail
- Invoices/payments
- Invoice detail
- Insights
- Goals
- Settings
- Cloud account
- Reminder queue
- Recurring setup
- Edit profile

## Technical Notes

- Expo React Native
- TypeScript
- Expo Router
- Zustand state store
- AsyncStorage persistence
- Reusable UI components
- Local mock data with calculated totals
- File attachment picker
- CSV report sharing
- Invoice PDF generation
- Cloud backup snapshot model
- Row-level security SQL migrations for user-owned backup rows

## Demo Script

1. Start on Home and show profit, pending payments, and goal progress.
2. Add an income transaction and show totals update.
3. Filter transactions by type, status, category, client, and month.
4. Long-press a transaction and show edit/delete action menu.
5. Open a client and show billed, paid, unpaid, invoices, and activity.
6. Create an invoice, queue a reminder, and share invoice PDF.
7. Mark an invoice as paid and show linked income behavior.
8. Open Insights and show cashflow, payment risk, top client, best month, savings rate, and tax estimate.
9. Open Goals and adjust monthly targets.
10. Open Settings and show report export, recurring setup, reminders, profile editing, and cloud backup.

## Business Value

SoloFlow demonstrates how a mobile-first product can reduce spreadsheet dependency for freelancers and give them a practical daily view of their business health. For KMAX, it proves mobile app development, finance-style dashboard logic, polished app UX, and backend-ready product thinking.

## Future Improvements

- Push/email reminder delivery
- Bank account linking
- Cloud file storage for attachments
- Production normalized tables
- Conflict merge flow
- Live exchange-rate conversion
