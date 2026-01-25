import { NextResponse } from 'next/server';
import { getPriceHistory } from '@/services/priceOracle';

export async function GET() {
  try {
    const history = await getPriceHistory(7);

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Price history API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch price history',
      },
      { status: 500 }
    );
  }
}
