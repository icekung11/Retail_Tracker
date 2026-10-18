# Retail Returns/Exchange Tracker — Workshop Master Package for Kiro

> **Overview**: This single Markdown document combines all three spec files (`requirements.md`, `design.md`, `tasks.md`) and the **Spec Phase Reflection Note** into one ready-to-paste file for Kiro workshops.

---

## 💡 Reflection Note: How Reason-Based Restock Rules Emerged

During the initial spec phase (0:00–0:30), mapping out data models (`Product` and `ReturnRecord`) revealed a major operational friction point in retail workflows:

> **The Problem**: Counter staff working under pressure default to marking items as "Restock: Yes". As a result, defective electronics or physically damaged goods frequently get returned to store shelves, creating secondary customer complaints and lost inventory accuracy.

> **The Insight & Rule**: Codifying return reasons into explicit default rules prevents human error:
> - `defective` & `damaged` → Default **Restock: OFF** (scrapped / quarantined)
> - `wrong_size` & `changed_mind` → Default **Restock: ON** (resellable inventory)
> - Staff retain an interactive override toggle with visual policy badges (`[POLICY RECOMMENDED: DO NOT RESTOCK]`).

This small business logic rule emerged naturally while writing `requirements.md` and became the centerpiece of the application design.

---

# SECTION 1: requirements.md

```markdown
# Requirements Specification: Retail Returns/Exchange Tracker

## 1. Product Overview
The **Retail Returns & Exchange Tracker** is a specialized back-office web application for store associates and managers to log product returns, manage inventory restock policies, process item exchanges with live balance calculations, view financial metrics by return reason, and run automated safety invariant checks.

## 2. Core Data Models

### 2.1 Product
- `id`: string (e.g., "prod-101")
- `name`: string
- `category`: string ("Electronics" | "Apparel" | "Furniture" | "Home")
- `price`: number (USD)
- `stock`: number (integer >= 0)
- `sku`: string
- `image`: string (URL)

### 2.2 ReturnRecord
- `id`: string (e.g., "RET-84920")
- `productId`: string
- `productName`: string
- `unitPrice`: number
- `qty`: number
- `reason`: 'defective' | 'wrong_size' | 'changed_mind' | 'damaged'
- `type`: 'return' | 'exchange'
- `restock`: boolean
- `refundAmount`: number (positive = refund to customer, negative = customer paid extra)
- `exchangeDetails`: ExchangeDetails | null
- `timestamp`: string (ISO 8601)
- `notes`: string?

### 2.3 ExchangeDetails
- `newProductId`: string
- `newProductName`: string
- `newQty`: number
- `newUnitPrice`: number
- `priceDifference`: number ( (Original Unit Price * Qty) - (New Unit Price * New Qty) )
- `balanceAction`: 'refund_to_customer' | 'customer_paid_extra' | 'even_exchange'

## 3. Business Rules & Logic
1. **Reason-Driven Restock Policy**:
   - `defective` / `damaged` -> Restock OFF (default)
   - `wrong_size` / `changed_mind` -> Restock ON (default)
   - Manual override toggle with visual policy badge.
2. **Exchange Price Math**:
   - Automated calculation of customer refund vs additional charge required.
3. **Inventory Invariants**:
   - Restocked items increment returned product stock.
   - Exchanged items decrement new product stock (enforcing `stock >= newQty`).
4. **Agent Hook Invariants**:
   - Automated test suite asserting non-negative stock levels and maximum refund caps on save.
```

---

# SECTION 2: design.md

```markdown
# Technical Design & Architecture: Retail Returns/Exchange Tracker

## 1. System Architecture
- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS with Glassmorphism Dark Theme design tokens
- **Icons**: Lucide React
- **Data Layer**: Browser `localStorage`; data is local to the current browser and device
- **Deployment**: Static export to GitHub Pages via GitHub Actions

## 2. Agent Hook & Invariants Engine
- **Invariant 1 (Stock Non-Negativity)**: `product.stock >= 0` across all items.
- **Invariant 2 (Refund Cap Guard)**: `refundAmount <= unitPrice * qty` (accounting for exchange diffs).
- **Invariant 3 (Restock Audit Compliance)**: Defective restocks flagged without audit notes.

## 3. UI Component Hierarchy
- `Header`: Store status, live sync badge, Agent Hook status button, Reset trigger.
- `SummaryCards`: Today's Refund Total, Total Transactions, Restocked vs Scrapped count, Top Cost Driver.
- `ReasonAnalytics`: Financial cost & item breakdown by return reason.
- `LogReturnModal`: Return vs Exchange tabbed form with real-time price math & restock toggle.
- `ReturnLogTable`: Filterable, searchable transaction log with CSV Export.
- `AgentHookModal`: Invariant test runner drawer with live status checks.
```

---

# SECTION 3: tasks.md

```markdown
# Roadmap & Execution Timeline

## Phase 1: 0:00–0:30 — Specification Phase
- [x] Write requirements.md with Product, ReturnRecord, and Exchange models.
- [x] Define reason-driven restock rules (`defective`/`damaged` -> OFF, `wrong_size`/`changed_mind` -> ON).
- [x] Write design.md and tasks.md roadmap.

## Phase 2: 0:30–1:15 — Core Data & Log Return Form
- [x] Seed 8 products across Electronics, Apparel, Furniture, Home.
- [x] Build Log Return Form with product selector, qty inputs, and auto-calc refund.

## Phase 3: 1:15–2:00 — Restock Logic & Stock Mutations
- [x] Implement reason-driven restock defaults with manual staff override toggle.
- [x] Connect return transactions to product inventory mutations.

## Phase 4: 2:00–2:30 — Exchange Mode & Analytics Summary
- [x] Implement Exchange Mode product swap UI with price-difference detection.
- [x] Build Today's Refund Total counter and Reason Cost Breakdown chart.
- [x] Build Return Log Table with search and reason filter.

## Phase 5: 2:30–2:45 — Agent Hook Assertions
- [x] Implement safety invariant engine asserting non-negative stock and refund caps.
- [x] Add Agent Hook status modal and on-save runner.

## Phase 6: 2:45–3:00 — Polish & CSV Export (Stretch)
- [x] Implement CSV Export for filtered return logs.
- [x] Add dataset reset utility for demo testing.
```
