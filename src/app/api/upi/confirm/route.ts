import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { GRAMS_PER_OUNCE } from '@/lib/constants';
import Decimal from 'decimal.js';

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth();

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, goldGrams, totalPayable, goldPricePerGram, fee, tds } = body;

    if (!orderId || !goldGrams) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Compute mock values (no DB write — demo only)
    const gramsDecimal = new Decimal(goldGrams);
    const xautAmount = gramsDecimal.dividedBy(GRAMS_PER_OUNCE);
    const mockTxHash = `0x${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`;

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        goldGrams: Number(goldGrams),
        xautAmount: xautAmount.toNumber(),
        txHash: mockTxHash,
        totalPayable: Number(totalPayable),
        fee: Number(fee || 0),
        tds: Number(tds || 0),
        goldPricePerGram: Number(goldPricePerGram),
      },
    });
  } catch (error) {
    console.error('UPI confirm error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
