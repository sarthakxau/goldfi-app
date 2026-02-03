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
    const { xautAmount, usdtAmount, swapTxHash, fromAddress } = body;

    console.log('[Sell Record API] Recording sell:', { xautAmount, usdtAmount, swapTxHash, fromAddress });

    // Validate inputs
    if (!xautAmount || !usdtAmount || !swapTxHash || !fromAddress) {
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
      console.log('[Sell Record API] User not found, creating transaction without user update');
      // Still return success - the swap happened on-chain, just can't record in DB
      return NextResponse.json({
        success: true,
        data: {
          message: 'Swap completed on-chain, but user record not found in database',
          swapTxHash,
        },
      });
    }

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'sell',
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
      console.error('[Sell Record API] Transaction record error:', txError);
      // Still return success - the swap happened on-chain
      return NextResponse.json({
        success: true,
        data: {
          message: 'Swap completed on-chain, but failed to record transaction',
          swapTxHash,
        },
      });
    }

    // Update holdings (deduct XAUT)
    const xautDecimal = new Decimal(xautAmount);

    const { data: holding } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (holding) {
      const currentAmount = new Decimal(holding.xaut_amount || 0);
      const newAmount = currentAmount.minus(xautDecimal);

      // Ensure we don't go negative
      const finalAmount = newAmount.lessThan(0) ? new Decimal(0) : newAmount;

      await supabase
        .from('holdings')
        .update({
          xaut_amount: finalAmount.toNumber(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    }

    console.log('[Sell Record API] Successfully recorded sell transaction');

    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('[Sell Record API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record sell' },
      { status: 500 }
    );
  }
}
