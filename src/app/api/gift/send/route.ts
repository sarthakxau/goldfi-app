import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import supabase from '@/lib/supabase';
import { createDirectGift, createEscrowGift } from '@/services/giftService';

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth();
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the sender's DB user
    const { data: senderUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('privy_user_id', authUser.privyUserId)
      .single();

    if (!senderUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      recipientEmail,
      recipientFound,
      recipientUserId,
      inrAmount,
      gramsAmount,
      occasion,
      message,
      paymentMethod,
      txHash,
      goldPriceInr,
      xautAmount,
    } = body;

    // Validate required fields
    if (!recipientEmail || !inrAmount || !gramsAmount || !occasion || !txHash || !xautAmount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Block self-gifting
    if (recipientEmail.toLowerCase().trim() === senderUser.email?.toLowerCase().trim()) {
      return NextResponse.json(
        { success: false, error: 'Cannot send a gift to yourself' },
        { status: 400 }
      );
    }

    const giftData = {
      recipientEmail,
      xautAmount,
      inrAmount,
      goldPriceInr: goldPriceInr || 0,
      gramsAmount,
      occasion,
      message,
      paymentMethod: paymentMethod || 'wallet',
      txHash,
    };

    if (recipientFound && recipientUserId) {
      // Direct gift — recipient exists
      const gift = await createDirectGift(senderUser.id, recipientUserId, giftData);
      return NextResponse.json({ success: true, data: { gift } });
    } else {
      // Escrow gift — recipient doesn't have an account
      const { gift, claimUrl } = await createEscrowGift(senderUser.id, giftData);
      return NextResponse.json({ success: true, data: { gift, claimUrl } });
    }
  } catch (error) {
    console.error('Gift send error:', error);
    const message = error instanceof Error ? error.message : 'Failed to send gift';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
