# Sommet360 AI – Sprint 1 Storybook

Clickable mock-ups showing how AI is integrated into existing Sommet360 screens (Sprint 1):

| Story | Page |
| --- | --- |
| AI-01 Business purpose document | `ai-01-expense-report.html` |
| AI-01 Receipt details & checks | `ai-01-receipt.html` |
| AI-02 Timesheet review | `ai-02-timesheet.html` |
| AI-02 HR/Payroll overview | `ai-02-team-overview.html` |
| AI-24 Assistant (knowledge engine) | `ai-24-assistant.html` |
| AI-03 Payroll run checks | `ai-03-payroll-checks.html` |
| AI-03 Risk report | `ai-03-risk-report.html` |

`index.html` is the storybook: pick a story on the left to preview it.

Static site, no build step. All names and amounts are demo data. New AI elements are marked with a purple ✦.

`assets/dc-lite.js` is a tiny template runtime (holes, `sc-if`, `sc-for`, click handlers, component state) used by every page.

## Deploy
Import this repo in Vercel as a static project (Framework preset: Other, no build command, output directory `.`).
