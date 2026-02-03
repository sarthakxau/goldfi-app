import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth';
import { getGoldPrice } from '@/services/priceOracle';
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
    const { inrAmount } = body;

    if (!inrAmount || typeof inrAmount !== 'number' || inrAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid INR amount' },
        { status: 400 }
      );
    }

    if (inrAmount < 100) {
      return NextResponse.json(
        { success: false, error: 'Minimum buy amount is ₹100' },
        { status: 400 }
      );
    }

    const price = await getGoldPrice();
    const xautAmount = new Decimal(inrAmount).dividedBy(price.priceInr);
    const usdtAmount = new Decimal(inrAmount).dividedBy(price.usdInrRate);

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

    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'buy',
        status: TX_STATUS.PENDING,
        inr_amount: inrAmount,
        xaut_amount: xautAmount.toNumber(),
        usdt_amount: usdtAmount.toNumber(),
        gold_price_usd: price.priceUsd,
        gold_price_inr: price.priceInr,
        usd_inr_rate: price.usdInrRate,
        to_address: user.wallet_address,
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
    await simulateBuyCompletion(transaction.id, user.id, xautAmount, inrAmount, price.priceInr);

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
    console.error('Buy transaction error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create buy order' },
      { status: 500 }
    );
  }
}

async function simulateBuyCompletion(
  transactionId: string,
  userId: string,
  xautAmount: Decimal,
  inrAmount: number,
  goldPriceInr: number
) {
  // Update transaction
  await supabase
    .from('transactions')
    .update({
      status: TX_STATUS.COMPLETED,
      completed_at: new Date().toISOString(),
      blockchain_tx_hash: `0x${Math.random().toString(16).slice(2)}`,
    })
    .eq('id', transactionId);

  // Get current holding
  const { data: holding } = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (holding) {
    const currentAmount = new Decimal(holding.xaut_amount || 0);
    const currentInvested = new Decimal(holding.total_invested_inr || 0);
    const newAmount = currentAmount.plus(xautAmount);
    const newInvested = currentInvested.plus(inrAmount);
    const newAvgPrice = newInvested.dividedBy(newAmount);

    await supabase
      .from('holdings')
      .update({
        xaut_amount: newAmount.toNumber(),
        total_invested_inr: newInvested.toNumber(),
        avg_buy_price_inr: newAvgPrice.toNumber(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  } else {
    await supabase.from('holdings').insert({
      user_id: userId,
      xaut_amount: xautAmount.toNumber(),
      total_invested_inr: inrAmount,
      avg_buy_price_inr: goldPriceInr,
    });
  }
}
