import { Product, ReturnRecord, AnalyticsSummary } from '@/types';
import seedProducts from '@/data/seedProducts.json';

const STORAGE_KEY = 'retail-returns-tracker:database';

export interface DatabaseSchema {
  products: Product[];
  returns: ReturnRecord[];
}

function getInitialData(): DatabaseSchema {
  return {
    products: seedProducts.map(product => ({ ...product })),
    returns: [
      {
        id: 'RET-801',
        productId: 'prod-103',
        productName: 'Vintage Espresso Grain Leather Jacket',
        unitPrice: 129.00,
        qty: 1,
        reason: 'wrong_size',
        type: 'return',
        restock: true,
        refundAmount: 129.00,
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        notes: 'Customer needed size Medium'
      },
      {
        id: 'RET-802',
        productId: 'prod-101',
        productName: 'Aura Pro ANC Wireless Headphones',
        unitPrice: 199.99,
        qty: 1,
        reason: 'defective',
        type: 'return',
        restock: false,
        refundAmount: 199.99,
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        notes: 'Left earcup silent'
      }
    ]
  };
}

export function getDatabase(): DatabaseSchema {
  if (typeof window === 'undefined') {
    throw new Error('The browser database is only available in the client.');
  }

  const storedData = window.localStorage.getItem(STORAGE_KEY);
  if (!storedData) {
    const initialData = getInitialData();
    saveDatabase(initialData);
    return initialData;
  }

  const data: unknown = JSON.parse(storedData);
  if (
    typeof data !== 'object' ||
    data === null ||
    !('products' in data) ||
    !('returns' in data) ||
    !Array.isArray(data.products) ||
    !Array.isArray(data.returns)
  ) {
    throw new Error('The saved browser database has an invalid format. Reset browser data to initialize it again.');
  }

  return data as DatabaseSchema;
}

export function saveDatabase(data: DatabaseSchema): void {
  if (typeof window === 'undefined') {
    throw new Error('The browser database is only available in the client.');
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetDatabase(): DatabaseSchema {
  const resetData: DatabaseSchema = {
    products: seedProducts.map(product => ({ ...product })),
    returns: []
  };
  saveDatabase(resetData);
  return resetData;
}

export function addReturnTransaction(
  payload: Omit<ReturnRecord, 'id' | 'timestamp'>
): { record: ReturnRecord; updatedProducts: Product[] } {
  const db = getDatabase();

  const productIndex = db.products.findIndex(p => p.id === payload.productId);
  if (productIndex === -1) {
    throw new Error(`Product ID ${payload.productId} not found.`);
  }

  const targetProduct = db.products[productIndex];
  if (payload.restock) {
    targetProduct.stock += payload.qty;
  }

  if (payload.type === 'exchange' && payload.exchangeDetails) {
    const newProdIndex = db.products.findIndex(p => p.id === payload.exchangeDetails?.newProductId);
    if (newProdIndex === -1) {
      throw new Error(`Exchange product ${payload.exchangeDetails.newProductId} not found.`);
    }

    const newProduct = db.products[newProdIndex];
    if (newProduct.stock < payload.exchangeDetails.newQty) {
      throw new Error(`Insufficient stock for exchange item: ${newProduct.name}. Available: ${newProduct.stock}`);
    }

    newProduct.stock -= payload.exchangeDetails.newQty;
  }

  const newRecord: ReturnRecord = {
    ...payload,
    id: `RET-${Math.floor(100000 + Math.random() * 900000)}`,
    timestamp: new Date().toISOString()
  };

  db.returns.unshift(newRecord);
  saveDatabase(db);

  return { record: newRecord, updatedProducts: db.products };
}

export function getAnalyticsSummary(db: DatabaseSchema = getDatabase()): AnalyticsSummary {
  const today = new Date().toISOString().split('T')[0];

  let todayRefundTotal = 0;
  let restockedCount = 0;
  let quarantinedCount = 0;

  const reasonBreakdown = {
    defective: { count: 0, totalCost: 0 },
    wrong_size: { count: 0, totalCost: 0 },
    changed_mind: { count: 0, totalCost: 0 },
    damaged: { count: 0, totalCost: 0 }
  };

  db.returns.forEach((r) => {
    if (r.restock) {
      restockedCount += r.qty;
    } else {
      quarantinedCount += r.qty;
    }

    if (reasonBreakdown[r.reason]) {
      reasonBreakdown[r.reason].count += r.qty;
      reasonBreakdown[r.reason].totalCost += Math.max(0, r.refundAmount);
    }

    if (r.timestamp.startsWith(today)) {
      todayRefundTotal += r.refundAmount;
    }
  });

  let topReason = 'None';
  let maxCost = -1;
  (Object.keys(reasonBreakdown) as Array<keyof typeof reasonBreakdown>).forEach((reason) => {
    if (reasonBreakdown[reason].totalCost > maxCost && reasonBreakdown[reason].count > 0) {
      maxCost = reasonBreakdown[reason].totalCost;
      topReason = reason;
    }
  });

  return {
    todayRefundTotal: Math.round(todayRefundTotal * 100) / 100,
    totalCount: db.returns.length,
    restockedCount,
    quarantinedCount,
    topReason,
    reasonBreakdown
  };
}
