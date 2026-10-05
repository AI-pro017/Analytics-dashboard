# Analytics Dashboard

A Next.js dashboard for tracking how a task processing system is being used: how many tasks run each week, how long they take, how many finish or fail, who's running them and what they cost.

All the charts are drawn with D3, and everything can be filtered by date range, user, status and run time, with an export button that downloads the data as CSV.

Live demo: https://analytics-dashboard-nine-topaz.vercel.app

## What's on the dashboard

- Summary cards for total and completed tasks, completion rate, average, fastest and slowest run time, and number of users.
- A weekly usage chart with task counts, average run time and completion rate per week.
- Run time trends by day, split by status (completed, failed, timed out, cancelled).
- A status breakdown chart.
- A user activity chart showing who runs the most tasks.
- A financial summary chart.
- Insight cards with the fastest, slowest and median run times, the success rate and the most active users.

## How it gets its data

This repo is the frontend only. It reads everything from a REST API (originally a FastAPI app serving data from a CSV file), which isn't part of this repo. The base URL is set at the top of `src/lib/apiClient.ts` and currently points at an old ngrok tunnel, so change it to wherever your API runs.

The frontend expects these endpoints, all accepting the same filter query parameters:

| Endpoint | Returns |
| --- | --- |
| `/api/dashboard/overview` | Summary numbers |
| `/api/dashboard/weekly-usage` | Per-week counts and averages |
| `/api/dashboard/execution-time-trends` | Daily run times by status |
| `/api/dashboard/status-distribution` | Count and share of each status |
| `/api/dashboard/user-activity` | Tasks per user |
| `/api/dashboard/financial-summary` | Data for the financial chart |
| `/api/dashboard/individual-tasks` | Raw task rows |
| `/api/dashboard/filtered-data` | Everything above in one call, for the current filters |
| `/api/dashboard/filter-options` | Available usernames and statuses |
| `/api/export/csv` | CSV download used by the Export button |
| `/api/health` | Health check |

The response shapes are defined as TypeScript interfaces in `src/lib/apiClient.ts`.

## Running it

```bash
git clone https://github.com/AI-pro017/Analytics-dashboard.git
cd Analytics-dashboard
npm install
npm run dev
```

Then open http://localhost:3000.

## Tech stack

- Next.js 15 (App Router) with React 19 and TypeScript
- D3 for charts
- Tailwind CSS 4
- Lucide icons

## Project structure

```text
src/
  app/page.tsx        The dashboard page, filters and data loading
  components/         One component per chart, plus filters and stat cards
  lib/apiClient.ts    API calls and response types
  lib/dataProcessor.ts  Helpers that reshape API data for the charts
```
