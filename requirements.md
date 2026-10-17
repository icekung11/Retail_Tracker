# Requirements Specification: Retail Returns/Exchange Tracker

## 1. Product Overview & Core Goal
The **Retail Returns & Exchange Tracker** is a specialized back-office web application designed for retail store staff and store managers. It streamlines product return logging, automates inventory restock policies based on return reasons, handles item exchanges with price-difference adjustments, provides real-time financial and operational metrics, and enforces inventory safety invariants.

---

## 2. Target Audience & Persona
- **Store Associate / Staff**: Logs returns quickly at the counter, selects exchange items, handles customer balance or refunds.
- **Store Manager**: Views daily return analytics, monitors financial impact by return reason, audits inventory restock decisions, exports return logs for audit.

---

## 3. System Data Models

### 3.1 Product
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique product ID (e.g., `prod-101`) |
| `name` | `string` | Product title (e.g., `Aura Pro Wireless Headphones`) |
| `category` | `string` | Product category (e.g., `Electronics`, `Apparel`) |
| `price` | `number` | Unit selling price in USD |
| `stock` | `number` | Current available inventory count |
| `sku` | `string` | Stock Keeping Unit code |
| `image` | `string` | Product visual representation |

### 3.2 ReturnRecord
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique transaction ID (e.g., `RET-84920`) |
| `productId` | `string` | ID of item being returned |
| `productName` | `string` | Snapshot of returned product name |
| `qty` | `number` | Quantity being returned |
| `reason` | `enum` | `defective`, `wrong_size`, `changed_mind`, `damaged` |
| `type` | `enum` | `return` (standard refund) or `exchange` (item swap) |
| `restock` | `boolean` | `true` if item is returned to stock; `false` if disposed/quarantined |
| `refundAmount` | `number` | Final refund paid to customer (or negative if customer owed balance) |
| `exchangeDetails` | `object?` | Present if `type === 'exchange'` |
| `timestamp` | `string` | ISO 8601 string when transaction occurred |
| `notes` | `string?` | Optional staff comments |

### 3.3 ExchangeDetails
| Field | Type | Description |
| :--- | :--- | :--- |
| `newProductId` | `string` | ID of new item customer is taking |
| `newProductName` | `string` | Name of new item |
| `newQty` | `number` | Quantity of new item |
| `priceDifference` | `number` | `(Original Unit Price * Original Qty) - (New Unit Price * New Qty)` |
| `balanceAction` | `enum` | `refund_to_customer`, `customer_paid_extra`, `even_exchange` |

---

## 4. Business Logic & Rules

### Rule 1: Reason-Driven Restock Policy
When selecting a return reason, the system automatically assigns the recommended restock toggle:
- `defective` → Default Restock: **OFF** (Item is faulty, do not resell)
- `damaged` → Default Restock: **OFF** (Item is physically damaged, do not resell)
- `wrong_size` → Default Restock: **ON** (Item is reusable/sellable)
- `changed_mind` → Default Restock: **ON** (Item is reusable/sellable)

*Staff Override*: Staff may manually toggle restock `ON` or `OFF` regardless of default recommendation, but the UI displays a subtle policy notice explaining the rule.

### Rule 2: Inventory Math Invariants
- If `restock === true`, `product.stock` increases by `returnRecord.qty`.
- If `restock === false`, `product.stock` remains unchanged.
- In **Exchange Mode**:
  - Returned item stock increases by `qty` (if `restock === true`).
  - New item stock MUST decrease by `newQty`.
  - **Invariant Check**: New item stock cannot drop below 0 (`stock - newQty >= 0`).

### Rule 3: Financial Calculations
- Standard Return: `refundAmount = originalProduct.price * qty`.
- Exchange: `priceDifference = (originalProduct.price * qty) - (newProduct.price * newQty)`
  - If `priceDifference > 0`: `refundAmount = priceDifference` (Refund to customer).
  - If `priceDifference < 0`: `refundAmount = priceDifference` (Customer pays additional `$|priceDifference|`).
  - If `priceDifference === 0`: `refundAmount = 0` (Even swap).

---

## 5. Core Requirements & Features
1. **Log Return Form**: Interactive modal/card to select item, quantity, reason, and view instant calculations.
2. **Restock Selector & Policy Visualizer**: Live toggle reflecting default rules with explanation tooltips.
3. **Exchange Flow**: Swap selector displaying unit price delta, net balance calculation, and stock availability check.
4. **Dashboard Summary**:
   - Total refunded today ($)
   - Total returns count
   - Items restocked vs quarantined
   - Reason cost breakdown mini-analytics (bar chart/progress cost breakdown)
5. **Return Log Table**: Filterable by return reason, searchable by product/ID, with instant sorting and pagination.
6. **Agent Hook Assertion Suite**: In-app automated sanity check running on save to guarantee zero negative stock and refund compliance.
7. **CSV Export** (Stretch): One-click download of filtered return log in CSV format.

---

## 6. Emerging Insights from Spec Phase
During the specification of reason-driven restock rules, we identified that automated restock defaults significantly reduce human error at the retail counter. By codifying `defective` and `damaged` items as non-restockable by default, store staff avoid accidentally putting faulty merchandise back on shelf displays. Furthermore, explicit price-difference logic in exchange mode eliminates mental math mistakes during busy retail hours.
