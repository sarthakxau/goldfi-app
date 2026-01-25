import { getTolaPrice } from '@/services/priceOracle';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const price = await getTolaPrice();
    return NextResponse.json({ success: true, data: price });
  } catch (error) {
    console.error('Error fetching tola price:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch price' },
      { status: 500 }
    );
  }
}
