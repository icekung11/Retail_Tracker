import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/storage';

export async function GET() {
  try {
    const db = getDatabase();
    return NextResponse.json({ products: db.products });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
