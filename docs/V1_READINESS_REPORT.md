# SoloFlow Mobile Readiness Report

## Status

SoloFlow Mobile is complete for portfolio demo use.

## Verified Scope

- Expo React Native app with TypeScript.
- Expo Router navigation and custom bottom tabs.
- First-launch onboarding gate.
- Calculated dashboard totals.
- Local mock data with AsyncStorage persistence.
- Add/edit/delete transactions.
- Transaction search, filters, and long-press action menu.
- Native document picker for transaction attachments.
- Clients list/detail and add/edit client flows.
- Invoices list/detail and add/edit invoice flows.
- Mark invoice as paid and sync paid invoices into income activity.
- Invoice PDF export through native share sheet.
- Reminder queue with mark-sent and delete actions.
- Recurring monthly setup with custom income/expense templates.
- Insights screen with chart-style summaries and tax estimate planning.
- Goals screen with editable targets and goal history cards.
- Settings with profile controls, report export, CSV sharing, cloud account, backup/restore, and reset demo data.
- Cloud backup/restore snapshot flow with reminders and preferences.
- Case study draft and portfolio QA checklist.

## Manual Android QA Checklist

- Onboarding screens fit on small Android display.
- Home dashboard numbers fit without clipping.
- Floating tab bar hides fully while scrolling.
- Floating tab bar does not cover final content when idle.
- Add/edit transaction forms scroll above keyboard.
- Transaction filters wrap cleanly.
- Long-press action menu is easy to trigger and use.
- Client cards fit long names/status badges.
- Invoice cards fit amount/date/status.
- Insights chart cards fit without text overlap.
- Goals history cards fit on the target phone.
- Settings controls and report summary wrap cleanly.
- Cloud restore warning appears before restore.

## Current Boundaries

These are intentionally outside portfolio scope:

- Real push/email reminder delivery.
- Real bank account linking.
- Cloud file upload/storage for attachments.
- Production conflict merge flow.
- Live exchange-rate conversion.
- Jurisdiction-specific tax calculations.

## Verification Command

Run from `soloflow-mobile`:

```text
npm run verify
```
