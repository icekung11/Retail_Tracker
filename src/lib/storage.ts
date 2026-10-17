import fs from 'fs';
import path from 'path';
import { Product, ReturnRecord, AnalyticsSummary } from '@/types';
import seedProducts from '@/data/seedProducts.json';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  products: Product[];
  returns: ReturnRecord[];
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      products: seedProducts,
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
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

export function getDatabase(): DatabaseSchema {
  ensureDataDir();
  try {
    const fileData = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error reading database file, returning default:', error);
    return { products: seedProducts, returns: [] };
  }
}

export function saveDatabase(data: DatabaseSchema): void {
  ensureDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function resetDatabase(): DatabaseSchema {
  ensureDataDir();
  const resetData: DatabaseSchema = {
    products: seedProducts,
    returns: []
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(resetData, null, 2), 'utf-8');
  return resetData;
}

export function addReturnTransaction(
  payload: Omit<ReturnRecord, 'id' | 'timestamp'>
): { record: ReturnRecord; updatedProducts: Product[] } {
  const db = getDatabase();
  
  // Find returned product
  const productIndex = db.products.findIndex(p => p.id === payload.productId);
  if (productIndex === -1) {
    throw new Error(`Product ID ${payload.productId} not found.`);
  }
  
  const targetProduct = db.products[productIndex];

  // If restock is ON, increment stock
  if (payload.restock) {
    targetProduct.stock += payload.qty;
  }

  // Handle Exchange specifics
  if (payload.type === 'exchange' && payload.exchangeDetails) {
    const newProdIndex = db.products.findIndex(p => p.id === payload.exchangeDetails?.newProductId);
    if (newProdIndex === -1) {
      throw new Error(`Exchange product ${payload.exchangeDetails.newProductId} not found.`);
    }

    const newProduct = db.products[newProdIndex];
    if (newProduct.stock < payload.exchangeDetails.newQty) {
      throw new Error(`Insufficient stock for exchange item: ${newProduct.name}. Available: ${newProduct.stock}`);
    }

    // Decrement stock for newly taken exchange product
    newProduct.stock -= payload.exchangeDetails.newQty;
  }

  // Create unique transaction record
  const newRecord: ReturnRecord = {
    ...payload,
    id: `RET-${Math.floor(100000 + Math.random() * 900000)}`,
    timestamp: new Date().toISOString()
  };

  db.returns.unshift(newRecord);
  saveDatabase(db);

  return { record: newRecord, updatedProducts: db.products };
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const db = getDatabase();
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
    // Restock counts
    if (r.restock) {
      restockedCount += r.qty;
    } else {
      quarantinedCount += r.qty;
    }

    // Reason cost tracking
    if (reasonBreakdown[r.reason]) {
      reasonBreakdown[r.reason].count += r.qty;
      reasonBreakdown[r.reason].totalCost += Math.max(0, r.refundAmount);
    }

    // Today's total refund (sum of positive refunds paid out today)
    if (r.timestamp.startsWith(today)) {
      todayRefundTotal += r.refundAmount;
    }
  });

  // Calculate highest cost reason
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
