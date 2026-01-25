import { NextResponse } from 'next/server';
import { getGoldPrice } from '@/services/priceOracle';

export async function GET() {
  try {
    const price = await getGoldPrice();

    return NextResponse.json({
      success: true,
      data: price,
    });
  } catch (error) {
    console.error('Price API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch gold price',
      },
      { status: 500 }
    );
  }
}
