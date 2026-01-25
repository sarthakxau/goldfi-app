import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TX_STATUS } from '@/lib/constants';

// Verify webhook signature (implement based on Onmeta docs)
function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.ONMETA_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('ONMETA_WEBHOOK_SECRET not configured');
    return false;
  }

  // TODO: Implement actual signature verification
  // This will depend on Onmeta's webhook signature format
  return true;
}

interface OnmetaWebhookPayload {
  event: string;
  orderId: string;
  status: 'success' | 'failed' | 'pending';
  txHash?: string;
  amount?: number;
  currency?: string;
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-onmeta-signature') || '';
    const body = await request.text();

    // Verify signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload: OnmetaWebhookPayload = JSON.parse(body);

    console.log('Onmeta webhook received:', payload);

    // Find transaction by Onmeta order ID
    const transaction = await prisma.transaction.findFirst({
      where: { onmetaOrderId: payload.orderId },
      include: { user: true },
    });

    if (!transaction) {
      console.error('Transaction not found for order:', payload.orderId);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    switch (payload.status) {
      case 'success':
        // Payment successful
        // In production:
        // 1. Execute DEX swap (USDT -> XAUT for buy, XAUT -> USDT for sell)
        // 2. Transfer tokens to/from user wallet
        // 3. Update holdings
        // 4. Update transaction status

        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: TX_STATUS.PROCESSING,
          },
        });

        // TODO: Trigger DEX swap and token transfer
        // This should be done in a background job for reliability

        break;

      case 'failed':
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: TX_STATUS.FAILED,
            errorMessage: 'Payment failed',
          },
        });
        break;

      case 'pending':
        // No action needed, transaction is still processing
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
