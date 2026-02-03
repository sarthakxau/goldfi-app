import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  try {
    const authUser = await verifyAuth();

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('privy_user_id', authUser.privyUserId)
      .single();

    if (!user) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }

    // Map to camelCase for frontend
    const mapped = (transactions || []).map((tx) => ({
      id: tx.id,
      userId: tx.user_id,
      type: tx.type,
      status: tx.status,
      xautAmount: tx.xaut_amount?.toString() || null,
      usdtAmount: tx.usdt_amount?.toString() || null,
      inrAmount: tx.inr_amount?.toString() || null,
      goldPriceUsd: tx.gold_price_usd?.toString() || null,
      goldPriceInr: tx.gold_price_inr?.toString() || null,
      usdInrRate: tx.usd_inr_rate?.toString() || null,
      blockchainTxHash: tx.blockchain_tx_hash,
      fromAddress: tx.from_address,
      toAddress: tx.to_address,
      onmetaOrderId: tx.onmeta_order_id,
      dexSwapTxHash: tx.dex_swap_tx_hash,
      errorMessage: tx.error_message,
      createdAt: tx.created_at,
      completedAt: tx.completed_at,
    }));

    return NextResponse.json({
      success: true,
      data: mapped,
    });
  } catch (error) {
    console.error('Transaction history API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
