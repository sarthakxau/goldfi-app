import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import supabase from '@/lib/supabase';
import { getGoldPrice } from '@/services/priceOracle';
import { TX_STATUS } from '@/lib/constants';
import Decimal from 'decimal.js';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const privyToken = cookieStore.get('privy-token');
  if (!privyToken) return null;
  return { privyUserId: 'dev-user' };
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { xautAmount: xautAmountInput } = body;

    if (!xautAmountInput || typeof xautAmountInput !== 'number' || xautAmountInput <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid XAUT amount' },
        { status: 400 }
      );
    }

    const xautAmount = new Decimal(xautAmountInput);

    // Get user with holding
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

    const { data: holding } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!holding) {
      return NextResponse.json(
        { success: false, error: 'No holdings found' },
        { status: 400 }
      );
    }

    const currentHolding = new Decimal(holding.xaut_amount || 0);

    if (xautAmount.greaterThan(currentHolding)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    const price = await getGoldPrice();
    const inrAmount = xautAmount.times(price.priceInr);
    const usdtAmount = xautAmount.times(price.priceUsd);

    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'sell',
        status: TX_STATUS.PENDING,
        xaut_amount: xautAmount.toNumber(),
        usdt_amount: usdtAmount.toNumber(),
        inr_amount: inrAmount.toNumber(),
        gold_price_usd: price.priceUsd,
        gold_price_inr: price.priceInr,
        usd_inr_rate: price.usdInrRate,
        from_address: user.wallet_address,
      })
      .select()
      .single();

    if (txError) {
      console.error('Error creating transaction:', txError);
      return NextResponse.json(
        { success: false, error: 'Failed to create transaction' },
        { status: 500 }
      );
    }

    // Simulate completion (dev only)
    await simulateSellCompletion(transaction.id, user.id, xautAmount, inrAmount);

    const { data: updatedTx } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transaction.id)
      .single();

    return NextResponse.json({
      success: true,
      data: updatedTx,
    });
  } catch (error) {
    console.error('Sell transaction error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create sell order' },
      { status: 500 }
    );
  }
}

async function simulateSellCompletion(
  transactionId: string,
  userId: string,
  xautAmount: Decimal,
  inrAmount: Decimal
) {
  // Update transaction
  await supabase
    .from('transactions')
    .update({
      status: TX_STATUS.COMPLETED,
      completed_at: new Date().toISOString(),
      blockchain_tx_hash: `0x${Math.random().toString(16).slice(2)}`,
      dex_swap_tx_hash: `0x${Math.random().toString(16).slice(2)}`,
    })
    .eq('id', transactionId);

  // Update holdings
  const { data: holding } = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (holding) {
    const currentAmount = new Decimal(holding.xaut_amount || 0);
    const currentInvested = new Decimal(holding.total_invested_inr || 0);
    const newAmount = currentAmount.minus(xautAmount);

    const soldProportion = xautAmount.dividedBy(currentAmount);
    const investedReduction = currentInvested.times(soldProportion);
    const newInvested = currentInvested.minus(investedReduction);

    await supabase
      .from('holdings')
      .update({
        xaut_amount: newAmount.toNumber(),
        total_invested_inr: newInvested.toNumber(),
        avg_buy_price_inr: newAmount.isZero()
          ? null
          : newInvested.dividedBy(newAmount).toNumber(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }
}
