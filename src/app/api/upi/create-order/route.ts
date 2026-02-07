import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

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
    const { inrAmount, totalPayable, goldGrams, goldPricePerGram } = body;

    // Validate inputs
    if (!inrAmount || !totalPayable || !goldGrams || !goldPricePerGram) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a mock Onmeta order ID (no DB write — demo only)
    const orderId = `onmeta_${crypto.randomUUID()}`;

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        transactionId: `mock_tx_${crypto.randomUUID()}`,
        paymentUrl: `https://mock-payment.onmeta.io/pay/${orderId}`,
      },
    });
  } catch (error) {
    console.error('UPI create order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create UPI order' },
      { status: 500 }
    );
  }
}
