export type ReturnReason = 'defective' | 'wrong_size' | 'changed_mind' | 'damaged';
export type ReturnType = 'return' | 'exchange';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  image: string;
}

export interface ExchangeDetails {
  newProductId: string;
  newProductName: string;
  newQty: number;
  newUnitPrice: number;
  priceDifference: number; // originalTotal - newTotal
  balanceAction: 'refund_to_customer' | 'customer_paid_extra' | 'even_exchange';
}

export interface ReturnRecord {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  qty: number;
  reason: ReturnReason;
  type: ReturnType;
  restock: boolean;
  refundAmount: number; // positive = paid to customer, negative = customer paid extra
  exchangeDetails?: ExchangeDetails;
  timestamp: string;
  notes?: string;
}

export interface ReasonMetrics {
  reason: ReturnReason;
  label: string;
  count: number;
  totalCost: number;
  color: string;
}

export interface AnalyticsSummary {
  todayRefundTotal: number;
  totalCount: number;
  restockedCount: number;
  quarantinedCount: number;
  topReason: string;
  reasonBreakdown: Record<ReturnReason, { count: number; totalCost: number }>;
}

export interface SingleAssertion {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  details: string;
}

export interface AssertionResult {
  timestamp: string;
  allPassed: boolean;
  assertions: SingleAssertion[];
}
