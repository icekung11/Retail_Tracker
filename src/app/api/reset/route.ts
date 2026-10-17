import { NextResponse } from 'next/server';
import { resetDatabase, getAnalyticsSummary } from '@/lib/storage';
import { runSafetyAssertions } from '@/lib/assertions';

export async function POST() {
  try {
    const db = resetDatabase();
    const analytics = getAnalyticsSummary();
    const assertions = runSafetyAssertions();
    return NextResponse.json({
      success: true,
      products: db.products,
      returns: db.returns,
      analytics,
      assertions
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 });
  }
}
