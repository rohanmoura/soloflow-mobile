# SoloFlow Mobile V1 Readiness Report

## V1 Status

SoloFlow Mobile v1 is complete for portfolio use.

## Verified V1 Scope

- Expo React Native app with TypeScript
- Expo Router navigation
- first-launch onboarding gate
- custom bottom tab navigation
- dashboard with calculated finance totals
- local mock data
- AsyncStorage persistence
- hydration/loading screen
- add/edit/delete transactions
- transaction search and filters
- date and attachment fields for transactions
- clients list/detail
- add/edit clients
- invoices list/detail
- add/edit invoices
- mark invoice as paid
- paid invoice to income transaction sync
- insights screen with chart-style visuals
- goals screen with editable targets
- settings with persisted preferences
- generated monthly report summary
- empty states, validation states, and success states
- KMAX case study draft and demo checklist

## Manual Android QA Checklist

- Onboarding screens fit on small Android display
- Home dashboard numbers fit without clipping
- Floating tab bar hides fully while scrolling
- Floating tab bar does not cover final content when idle
- Add/edit transaction forms scroll above keyboard
- Transaction filters wrap cleanly
- Client cards fit long names/status badges
- Invoice cards fit amount/date/status
- Insights chart cards fit without text overlap
- Settings controls and report summary wrap cleanly

## V1 Known Boundaries

- Report export is an in-app generated summary, not a downloaded CSV/PDF file.
- Reminder action queues an in-app confirmation state, not a real push notification.
- Dark mode preview is persisted as a preference flag, not a full theme switch.
- Bank connections, cloud sync, auth, real invoice files, and push reminders are intentionally v2.

## V2 Start Criteria

Start v2 after screenshots/demo are captured and the case study draft is finalized.

V2 should focus on:

- Supabase auth
- Supabase database and row-level security
- cloud sync
- PDF/CSV exports
- push payment reminders
- recurring transactions
- multi-currency conversion
- tax estimate module
