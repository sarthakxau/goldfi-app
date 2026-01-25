import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import supabase from '@/lib/supabase';
import { getGoldPrice } from '@/services/priceOracle';
import Decimal from 'decimal.js';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const privyToken = cookieStore.get('privy-token');
  if (!privyToken) return null;
  return { privyUserId: 'dev-user' };
}

export async function GET() {
  try {
    const authUser = await getCurrentUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find user
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('privy_user_id', authUser.privyUserId)
      .single();

    if (userError && userError.code === 'PGRST116') {
      // User not found, create one
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          privy_user_id: authUser.privyUserId,
          wallet_address: '0x0000000000000000000000000000000000000000',
          kyc_status: 'pending',
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { success: false, error: 'Failed to create user' },
          { status: 500 }
        );
      }

      user = newUser;

      // Create default holding
      await supabase.from('holdings').insert({
        user_id: user.id,
        xaut_amount: 0,
        total_invested_inr: 0,
      });
    } else if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user' },
        { status: 500 }
      );
    }

    // Get holding
    const { data: holding } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!holding) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    // Calculate current values
    const price = await getGoldPrice();
    const xautAmount = new Decimal(holding.xaut_amount || 0);
    const totalInvested = new Decimal(holding.total_invested_inr || 0);
    const currentValue = xautAmount.times(price.priceInr);
    const profitLoss = currentValue.minus(totalInvested);
    const profitLossPercent = totalInvested.isZero()
      ? new Decimal(0)
      : profitLoss.dividedBy(totalInvested).times(100);

    return NextResponse.json({
      success: true,
      data: {
        id: holding.id,
        userId: holding.user_id,
        xautAmount: holding.xaut_amount?.toString() || '0',
        totalInvestedInr: holding.total_invested_inr?.toString() || '0',
        avgBuyPriceInr: holding.avg_buy_price_inr?.toString() || null,
        currentValueInr: currentValue.toNumber(),
        profitLossInr: profitLoss.toNumber(),
        profitLossPercent: profitLossPercent.toNumber(),
        xautAmountGrams: xautAmount.times(31.1035).toNumber(),
      },
    });
  } catch (error) {
    console.error('Holdings API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch holdings' },
      { status: 500 }
    );
  }
}
