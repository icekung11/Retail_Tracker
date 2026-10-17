# Technical Design & Architecture: Retail Returns/Exchange Tracker

## 1. System Architecture
The application is structured as a modern Next.js 14+ full-stack web application using TypeScript, Tailwind CSS, Lucide icons, and serverless API endpoints backed by a persistent local JSON data store.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend Client                          │
│                                                                        │
│  ┌───────────────────┐  ┌────────────────────┐  ┌──────────────────┐  │
│  │   Hero Summary    │  │ Log Return / Swap  │  │ Agent Hook Modal │  │
│  │   & Analytics     │  │   Form Controller  │  │ & Assertions UI  │  │
│  └─────────┬─────────┘  └─────────┬──────────┘  └────────┬─────────┘  │
│            │                      │                      │             │
│  ┌─────────┴──────────────────────┴──────────────────────┴──────────┐  │
│  │                 Return Log Table & Filter Engine                 │  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │ HTTP / REST API
┌───────────────────────────────────▼────────────────────────────────────┐
│                        Next.js Server API Routes                       │
│                                                                        │
│  ┌───────────────────────┐ ┌───────────────────┐ ┌──────────────────┐ │
│  │ GET/POST /api/products│ │ POST /api/returns │ │POST /api/test... │ │
│  └───────────┬───────────┘ └─────────┬─────────┘ └────────┬─────────┘ │
└──────────────┼───────────────────────┼────────────────────┼────────────┘
               │                       │                    │
┌──────────────▼───────────────────────▼────────────────────▼────────────┐
│                    Storage Engine (`src/lib/storage.ts`)               │
│                    - `db.json` (Products + Returns)                    │
│                    - Transaction Safety & Invariant Engine             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design System & Aesthetics
- **Theme**: Premium Retail Back-office Dark Theme with sleek glassmorphism panels.
- **Color Palette**:
  - Primary Accent: Deep Indigo / Violet (`#6366f1` / `#4f46e5`)
  - Success (Restocked/Positive Balance): Emerald (`#10b981`)
  - Warning (Refund/Quarantined): Amber / Rose (`#f59e0b` / `#f43f5e`)
  - Background: Obsidian Dark Slate (`#0f172a` / `#1e293b`)
  - Cards & Modals: Glassmorphic translucent panels with subtle border glow (`bg-slate-900/80 backdrop-blur-md border-slate-800`).
- **Typography**: Inter / Outfit sans-serif hierarchy with tabbed numerical alignment for financial figures.
- **Micro-interactions**: Dynamic reactive balance badges, live animated total counters, hover glow on buttons, smooth tab transitions.

---

## 3. Data Flow & State Management

### 3.1 Return Submission Workflow
1. User opens **Log Return / Exchange** modal.
2. User selects returned product and quantity.
3. User selects return reason (`defective`, `wrong_size`, `changed_mind`, `damaged`).
4. System sets default restock toggle:
   - `defective`/`damaged` -> `restock = false`
   - `wrong_size`/`changed_mind` -> `restock = true`
5. If **Exchange Mode** is active:
   - User selects target swap product and quantity.
   - System computes:
     `origTotal = product.price * qty`
     `newTotal = swapProduct.price * swapQty`
     `diff = origTotal - newTotal`
6. Submitting form triggers `POST /api/returns`.
7. Server validates invariants:
   - Target swap product has sufficient stock (`swapProduct.stock >= swapQty`).
   - Quantities are positive integers.
8. Server updates `db.json` atomically:
   - Adjusts product stock.
   - Writes `ReturnRecord`.
   - Executes Agent Hook assertions.
9. UI receives response and performs live state refresh.

---

## 4. API Schema Definition

### `GET /api/products`
Returns current list of products with updated stock.

### `POST /api/returns`
Payload:
```json
{
  "productId": "prod-101",
  "qty": 1,
  "reason": "defective",
  "type": "return",
  "restock": false,
  "exchangeDetails": null,
  "notes": "Left speaker crackles"
}
```

### `POST /api/test-assertions`
Runs safety invariant suite against state.
Response:
```json
{
  "timestamp": "2026-07-22T13:37:00.000Z",
  "allPassed": true,
  "assertions": [
    { "name": "Inventory Non-Negative Check", "passed": true, "details": "All 8 products have stock >= 0" },
    { "name": "Refund Upper Bound Guard", "passed": true, "details": "All return records maintain valid refund caps" },
    { "name": "Restock Audit Compliance", "passed": true, "details": "Restock policies match logged specifications" }
  ]
}
```

---

## 5. UI Component Hierarchy
- `src/app/page.tsx`
  - `Header`: Title, active store badge, reset data button, Agent Hook status indicator.
  - `SummaryCards`: Live refund total, total returns, restocked count, top defective item.
  - `AnalyticsSection`: Reason cost breakdown chart & restock ratio indicator.
  - `ReturnFormModal`: Tabbed return vs exchange log form with real-time math.
  - `ReturnLogTable`: Data grid with status badges, search filter, reason filter, CSV exporter.
  - `AgentHookModal`: Invariant test audit drawer showing real-time assertion metrics.
