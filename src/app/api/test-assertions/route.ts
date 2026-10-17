import { NextResponse } from 'next/server';
import { runSafetyAssertions } from '@/lib/assertions';

export async function GET() {
  try {
    const assertions = runSafetyAssertions();
    return NextResponse.json(assertions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to run assertions' }, { status: 500 });
  }
}
