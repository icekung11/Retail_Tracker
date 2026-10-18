# Retail Returns/Exchange Tracker — Kiro Workshop Package

This document contains the complete specification suite (`requirements.md`, `design.md`, `tasks.md`) and the **Spec Phase Reflection Note** ready to paste into Kiro.

---

## 📝 Spec Phase Reflection Note: How Reason-Based Restock Rules Emerged

During the specification phase (0:00–0:30), mapping out data models and edge cases revealed an important operational flaw in standard retail return workflows:

> **The Problem**: Store staff working under pressure at the counter often default to marking every item as "Restock: Yes" unless prompted otherwise. This results in defective or physically damaged items being returned to store shelves, leading to secondary negative customer experiences.

> **The Solution**: By introducing **Reason-Driven Restock Logic** directly into the core specification:
> 1. `defective` & `damaged` default to **Restock: OFF** (quarantined/discarded).
> 2. `wrong_size` & `changed_mind` default to **Restock: ON** (resellable).
> 3. Store staff retain an explicit override toggle with clear visual badge feedback (`[POLICY RECOMMENDED: DO NOT RESTOCK]`).

This small business logic rule emerged naturally while defining the `ReturnReason` enum in `requirements.md` and proved to be the most impactful UX feature for store operations.

---

# Spec File 1: requirements.md

```markdown
# Requirements Specification: Retail Returns/Exchange Tracker

## 1. Product Overview & Core Goal
The **Retail Returns & Exchange Tracker** is a specialized back-office web application designed for retail store staff and store managers. It streamlines product return logging, automates inventory restock policies based on return reasons, handles item exchanges with price-difference adjustments, provides real-time financial and operational metrics, and enforces inventory safety invariants.

## 2. System Data Models

### 2.1 Product
- `id`: string (e.g. "prod-101")
- `name`: string
- `category`: string
- `price`: number (USD)
- `stock`: number (integer >= 0)
- `sku`: string

### 2.2 ReturnRecord
- `id`: string (e.g. "RET-84920")
- `productId`: string
- `productName`: string
- `qty`: number
- `reason`: 'defective' | 'wrong_size' | 'changed_mind' | 'damaged'
- `type`: 'return' | 'exchange'
- `restock`: boolean
- `refundAmount`: number
- `exchangeDetails`: ExchangeDetails | null
- `timestamp`: string (ISO 8601)

### 2.3 ExchangeDetails
- `newProductId`: string
- `newProductName`: string
- `newQty`: number
- `priceDifference`: number ( (OrigPrice * OrigQty) - (NewPrice * NewQty) )
- `balanceAction`: 'refund_to_customer' | 'customer_paid_extra' | 'even_exchange'

## 3. Core Features & Business Rules
1. **Reason-Driven Restock Rules**:
   - `defective` / `damaged` -> Restock OFF (default)
   - `wrong_size` / `changed_mind` -> Restock ON (default)
2. **Exchange Balance Logic**:
   - Automated net price difference calculations.
3. **Refund Total & Mini-Analytics**:
   - Live daily refund total, count by reason, cost by reason.
4. **Agent Hook Assertion Invariants**:
   - Assert stock >= 0 post-transaction.
   - Assert refundAmount <= original item price * qty.
```

---

# Spec File 2: design.md

```markdown
# Technical Design & Architecture: Retail Returns/Exchange Tracker

## 1. System Architecture
- **Framework**: Next.js 14+ (App Router) + TypeScript
- **Styling**: Tailwind CSS + Glassmorphism Dark Theme design system
- **Data Persistence**: Browser `localStorage`; data is local to the current browser and device
- **Deployment**: Static export to GitHub Pages via GitHub Actions

## 2. Invariant Safety Guard (Agent Hook)
- **Invariant 1**: Non-Negative Inventory (`stock >= 0`).
- **Invariant 2**: Refund Amount Bound (`refundAmount <= origPrice * qty`).
- **Invariant 3**: Exchange Availability Guard (`newProduct.stock >= newQty`).

## 3. UI Component Hierarchy
- Dashboard Header & Active Store Status
- Summary Metrics Cards (Refund Total, Total Count, Restock Ratio)
- Reason Cost Breakdown Analytics
- Return & Exchange Modal Form with Live Policy Badges
- Filterable & Searchable Return Log Table
- Invariant Safety Assertion Modal
```

---

# Spec File 3: tasks.md

```markdown
# Roadmap & Execution Tasks

## 0:00–0:30 — Specification Phase
- [x] Write requirements.md, design.md, tasks.md.
- [x] Codify reason-driven restock rules & exchange balance logic.

## 0:30–1:15 — Core Data & Return Form
- [x] Seed 8 retail products across Electronics, Apparel, Furniture, Home.
- [x] Build Log Return form with live refund auto-calculation.

## 1:15–2:00 — Restock Logic & Stock Mutations
- [x] Implement reason-driven restock defaults with manual override.
- [x] Connect return logging to real-time inventory increment.

## 2:00–2:30 — Exchange Mode & Analytics Summary
- [x] Implement product swap UI with price-difference detection.
- [x] Build Today's Refund Total & Reason Breakdown charts.

## 2:30–2:45 — Agent Hook Assertions
- [x] Implement automated validation runner asserting non-negative stock and refund caps.

## 2:45–3:00 — Polish & CSV Export
- [x] Implement CSV Export and dataset reset utility.
```
