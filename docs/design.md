# Technical Design & Architecture: Retail Returns/Exchange Tracker

## 1. System Architecture
- **Framework**: Next.js 14+ (App Router) + TypeScript
- **Styling**: Tailwind CSS + Glassmorphism Dark Theme design system
- **Deployment**: Static export to GitHub Pages through GitHub Actions.
- **Data Persistence**: Browser `localStorage`; data is local to one browser and device.
- **Data Operations**: Inventory, returns, reset, analytics, and assertions run in the browser; there are no server API routes.

## 2. Invariant Safety Guard (Agent Hook)
- **Invariant 1**: Non-Negative Inventory (`stock >= 0`).
- **Invariant 2**: Refund Amount Bound (`refundAmount <= origPrice * qty`).
- **Invariant 3**: Restock Audit Compliance.

## 3. UI Component Hierarchy
- `Header`: Store status, live sync badge, Agent Hook status button, Reset trigger.
- `SummaryCards`: Today's Refund Total, Total Transactions, Restocked vs Scrapped count, Top Cost Driver.
- `ReasonAnalytics`: Financial cost & item breakdown by return reason.
- `LogReturnModal`: Return vs Exchange tabbed form with real-time price math & restock toggle.
- `ReturnLogTable`: Filterable, searchable transaction log with CSV Export.
- `AgentHookModal`: Invariant test runner drawer with live status checks.
