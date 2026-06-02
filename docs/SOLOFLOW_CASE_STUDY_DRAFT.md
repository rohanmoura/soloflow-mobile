# SoloFlow Mobile Case Study Draft

## Title

SoloFlow Mobile: A freelancer finance tracker for income, expenses, clients, invoices, and monthly goals.

## Short Description

SoloFlow Mobile is a React Native mobile app that helps freelancers and solo business owners understand their monthly cashflow, track client payments, manage invoices, and monitor business goals from one clean mobile dashboard.

## Problem

Freelancers often track income, expenses, invoices, and client follow-ups across scattered tools. Spreadsheets are slow on mobile, while full accounting tools can feel too heavy for daily use. The core question SoloFlow answers is: how is my month going?

## Solution

SoloFlow gives independent workers a mobile-first finance workspace with:

- onboarding and setup preferences
- monthly profit dashboard
- income and expense tracking
- transaction search and filters
- client money summaries
- invoice/payment tracking
- mark-as-paid workflow
- goal progress
- insights and chart-style summaries
- local persistence with AsyncStorage

## Role

- product strategy
- mobile UX design
- React Native development
- local data modeling
- finance calculation logic
- app interaction design
- portfolio case study preparation

## Key Screens

- onboarding
- home dashboard
- money activity
- add/edit transaction
- clients
- client detail
- invoices/payments
- invoice detail
- insights
- goals
- settings

## Technical Notes

- Expo React Native
- TypeScript
- Expo Router
- Zustand state store
- AsyncStorage persistence
- reusable UI components
- local mock data
- calculated dashboard totals
- invoice-to-transaction sync when marked paid
- backend-ready model structure for v2

## Demo Script

1. Start on dashboard and show profit, pending payments, and goal progress.
2. Add an income transaction and show totals update.
3. Filter transactions by type, category, client, and month.
4. Open a client and show billed, paid, unpaid, invoices, and activity.
5. Create an invoice from the client detail screen.
6. Mark an invoice as paid and show the linked income transaction behavior.
7. Open Insights and show cashflow, payment risk, client concentration, and best month.
8. Open Goals and adjust monthly targets.
9. Open Settings and show saved preferences, report summary, and reset demo controls.

## Screenshot Checklist

- Home dashboard
- Add transaction
- Transactions filters
- Client list
- Client detail
- Invoice list
- Invoice detail
- Insights
- Goals
- Settings

## V2 Roadmap

- Supabase auth
- Supabase Postgres database
- cloud sync
- invoice PDF export
- CSV reports
- push payment reminders
- recurring transactions
- bank connection placeholder
- multi-currency conversion
- tax estimate module
