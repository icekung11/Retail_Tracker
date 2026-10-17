# Timeline & Tasks: Retail Returns/Exchange Tracker

## Phase 1: 0:00–0:30 — Specification & Architecture
- [x] Create `requirements.md` capturing domain models, restock business logic, exchange math, and rules.
- [x] Create `design.md` detailing tech architecture, API schemas, UI design system, and component tree.
- [x] Create `tasks.md` setting up the 3-hour execution roadmap and stretch goals.

## Phase 2: 0:30–1:15 — Core Data & Log Return Form
- [x] Set up Next.js app structure with TypeScript & Tailwind CSS.
- [x] Define TypeScript data models (`Product`, `ReturnRecord`, `ExchangeDetails`, `AssertionResult`).
- [x] Initialize seed dataset with 8 realistic products across electronics, apparel, and home decor.
- [x] Create file-based storage manager (`src/lib/storage.ts`) and API routes (`/api/products`, `/api/returns`).
- [x] Build Log Return Form with product dropdown, quantity inputs, reason selector, and live refund calculation.

## Phase 3: 1:15–2:00 — Restock Logic & Stock Management
- [x] Implement reason-based automated restock defaults (`defective`/`damaged` -> OFF; `wrong_size`/`changed_mind` -> ON).
- [x] Add interactive staff restock override toggle with policy badge visualizer.
- [x] Connect return transactions to product inventory mutations (stock increment on restock).
- [x] Update product catalog cards and table to reflect live inventory updates in real time.

## Phase 4: 2:00–2:30 — Exchange Mode & Analytics Summary
- [x] Build Exchange Mode tab in log form for swapping returned item for another store product.
- [x] Implement price difference calculation (Refund to Customer vs. Extra Payment Required).
- [x] Build Summary Metrics Cards (Today's Refund Total, Total Returns, Restocked Units Count).
- [x] Build Reason Breakdown Mini-Analytics (Visual cost bar by return reason).
- [x] Implement Return Log Table with search input, reason filter dropdown, and detailed record viewing.

## Phase 5: 2:30–2:45 — Agent Hook & Invariant Test Suite
- [x] Build assertion engine (`src/lib/assertions.ts`) asserting non-negative stock and refund caps.
- [x] Connect Agent Hook to run on every transaction save.
- [x] Build Agent Hook modal/drawer UI to display live assertion pass/fail results.

## Phase 6: 2:45–3:00 — Polish, CSV Export & Verification
- [x] Implement CSV Export feature for downloading return logs (Stretch goal).
- [x] Add dataset reset button to restore default seed products and clear logs for demo testing.
- [x] Perform full end-to-end verification.
