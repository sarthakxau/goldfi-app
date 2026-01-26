import { NextRequest, NextResponse } from 'next/server';
import { parseUnits, formatUnits } from 'viem';
import { getXautToUsdtQuote } from '@/services/dexService';
import {
  XAUT_DECIMALS,
  USDT_DECIMALS,
  SLIPPAGE_TOLERANCE,
  QUOTE_VALIDITY_SECONDS
} from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const xautAmountStr = searchParams.get('xautAmount');

    console.log('[Sell Quote API] Received request for xautAmount:', xautAmountStr);

    if (!xautAmountStr) {
      return NextResponse.json(
        { success: false, error: 'xautAmount is required' },
        { status: 400 }
      );
    }

    const xautAmount = parseFloat(xautAmountStr);
    if (isNaN(xautAmount) || xautAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid xautAmount' },
        { status: 400 }
      );
    }

    // Convert to bigint with proper decimals
    const xautAmountBigInt = parseUnits(xautAmountStr, XAUT_DECIMALS);
    console.log('[Sell Quote API] XAUT amount bigint:', xautAmountBigInt.toString());

    let expectedUsdtBigInt: bigint;

    // Get quote from DEX
    try {
      console.log('[Sell Quote API] Fetching DEX quote...');
      expectedUsdtBigInt = await getXautToUsdtQuote(xautAmountBigInt);
      console.log('[Sell Quote API] DEX quote successful:', expectedUsdtBigInt.toString());
    } catch (dexError) {
      console.error('[Sell Quote API] DEX quote failed:', dexError);
      return NextResponse.json(
        { success: false, error: 'Failed to get quote from DEX' },
        { status: 500 }
      );
    }

    // Calculate min amount out with slippage
    const slippageMultiplier = BigInt(Math.floor((1 - SLIPPAGE_TOLERANCE) * 10000));
    const minAmountOutBigInt = (expectedUsdtBigInt * slippageMultiplier) / BigInt(10000);

    // Format values
    const expectedUsdt = formatUnits(expectedUsdtBigInt, USDT_DECIMALS);
    const minAmountOut = formatUnits(minAmountOutBigInt, USDT_DECIMALS);

    // Estimate gas (approximate)
    const gasEstimate = '0.0001'; // ~0.0001 ETH for swap

    const quote = {
      xautAmount: xautAmountStr,
      expectedUsdt,
      minAmountOut,
      slippage: SLIPPAGE_TOLERANCE * 100, // 0.5%
      gasEstimate,
      validUntil: new Date(Date.now() + QUOTE_VALIDITY_SECONDS * 1000).toISOString(),
    };

    console.log('[Sell Quote API] Returning quote:', quote);

    return NextResponse.json({
      success: true,
      data: quote,
    });

  } catch (error) {
    console.error('[Sell Quote API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sell quote' },
      { status: 500 }
    );
  }
}
