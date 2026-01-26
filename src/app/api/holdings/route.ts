import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import supabase from '@/lib/supabase';
import { getGoldPrice } from '@/services/priceOracle';
import { publicClient, ERC20_ABI } from '@/lib/viem';
import { CONTRACTS, XAUT_DECIMALS, GRAMS_PER_OUNCE } from '@/lib/constants';
import Decimal from 'decimal.js';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const privyToken = cookieStore.get('privy-token');
  if (!privyToken) return null;
  return { privyUserId: 'dev-user' };
}

async function getOnChainBalance(walletAddress: string): Promise<Decimal> {
  try {
    const balanceRaw = await publicClient.readContract({
      address: CONTRACTS.XAUT0,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [walletAddress as `0x${string}`],
    });
    
    // Convert from raw units (6 decimals) to XAUT amount
    return new Decimal(balanceRaw.toString()).dividedBy(
      new Decimal(10).pow(XAUT_DECIMALS)
    );
  } catch (error) {
    console.error('Error fetching on-chain balance:', error);
    return new Decimal(0);
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const walletAddressParam = searchParams.get('walletAddress');

  try {
    // Get current gold price (needed for all cases)
    const price = await getGoldPrice();

    // If wallet address is provided, fetch on-chain balance directly
    // This allows the client to get holdings without requiring database auth
    if (walletAddressParam && walletAddressParam !== '0x0000000000000000000000000000000000000000') {
      const xautAmount = await getOnChainBalance(walletAddressParam);
      const currentValue = xautAmount.times(price.priceInr);

      return NextResponse.json({
        success: true,
        data: {
          id: null,
          userId: null,
          xautAmount: xautAmount.toString(),
          totalInvestedInr: '0',
          avgBuyPriceInr: null,
          currentValueInr: currentValue.toNumber(),
          profitLossInr: 0,
          profitLossPercent: 0,
          xautAmountGrams: xautAmount.times(GRAMS_PER_OUNCE).toNumber(),
        },
      });
    }

    // Otherwise, use database-backed authentication
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

    // Get holding from database
    const { data: holding } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Fetch on-chain XAUT balance using database wallet address
    let xautAmount = new Decimal(0);
    const walletAddress = user.wallet_address;
    
    if (walletAddress && walletAddress !== '0x0000000000000000000000000000000000000000') {
      xautAmount = await getOnChainBalance(walletAddress);
    }

    const totalInvested = new Decimal(holding?.total_invested_inr || 0);
    const currentValue = xautAmount.times(price.priceInr);
    const profitLoss = currentValue.minus(totalInvested);
    const profitLossPercent = totalInvested.isZero()
      ? new Decimal(0)
      : profitLoss.dividedBy(totalInvested).times(100);

    return NextResponse.json({
      success: true,
      data: {
        id: holding?.id || null,
        userId: user.id,
        xautAmount: xautAmount.toString(),
        totalInvestedInr: totalInvested.toString(),
        avgBuyPriceInr: holding?.avg_buy_price_inr?.toString() || null,
        currentValueInr: currentValue.toNumber(),
        profitLossInr: profitLoss.toNumber(),
        profitLossPercent: profitLossPercent.toNumber(),
        xautAmountGrams: xautAmount.times(GRAMS_PER_OUNCE).toNumber(),
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

