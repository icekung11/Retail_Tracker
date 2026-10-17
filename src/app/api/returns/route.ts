import { NextResponse } from 'next/server';
import { getDatabase, addReturnTransaction, getAnalyticsSummary } from '@/lib/storage';
import { runSafetyAssertions } from '@/lib/assertions';

export async function GET() {
  try {
    const db = getDatabase();
    const analytics = getAnalyticsSummary();
    return NextResponse.json({ returns: db.returns, analytics });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch return records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, qty, reason, type, restock, refundAmount, exchangeDetails, notes, unitPrice, productName } = body;

    if (!productId || !qty || !reason) {
      return NextResponse.json({ error: 'Missing required return fields' }, { status: 400 });
    }

    const result = addReturnTransaction({
      productId,
      productName,
      unitPrice,
      qty: Number(qty),
      reason,
      type: type || 'return',
      restock: Boolean(restock),
      refundAmount: Number(refundAmount),
      exchangeDetails,
      notes
    });

    // Run Agent Hook Assertions post-save
    const assertionsResult = runSafetyAssertions();

    return NextResponse.json({
      success: true,
      record: result.record,
      products: result.updatedProducts,
      analytics: getAnalyticsSummary(),
      assertions: assertionsResult
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Transaction failed' }, { status: 400 });
  }
}
