import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth';
import { TX_STATUS } from '@/lib/constants';
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
    const { usdtAmount, xautAmount, swapTxHash, fromAddress } = body;

    // Validate inputs
    if (!usdtAmount || !xautAmount || !swapTxHash || !fromAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('privy_user_id', authUser.privyUserId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'buy',
        status: TX_STATUS.COMPLETED,
        usdt_amount: Number(usdtAmount),
        xaut_amount: Number(xautAmount),
        dex_swap_tx_hash: swapTxHash,
        from_address: fromAddress,
        to_address: user.wallet_address,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (txError) {
      console.error('Transaction record error:', txError);
      return NextResponse.json(
        { success: false, error: 'Failed to record transaction' },
        { status: 500 }
      );
    }

    // Update holdings
    const xautDecimal = new Decimal(xautAmount);

    const { data: holding } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (holding) {
      const currentAmount = new Decimal(holding.xaut_amount || 0);
      const newAmount = currentAmount.plus(xautDecimal);

      await supabase
        .from('holdings')
        .update({
          xaut_amount: newAmount.toNumber(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    } else {
      await supabase.from('holdings').insert({
        user_id: user.id,
        xaut_amount: xautDecimal.toNumber(),
        total_invested_inr: 0,
      });
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Swap record error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record swap' },
      { status: 500 }
    );
  }
}
