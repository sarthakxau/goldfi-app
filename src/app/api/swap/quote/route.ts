import { NextRequest, NextResponse } from 'next/server';
import { getUsdtToXautQuote } from '@/services/dexService';
import {
  USDT_DECIMALS,
  XAUT_DECIMALS,
  SLIPPAGE_TOLERANCE,
  GRAMS_PER_OUNCE,
  QUOTE_VALIDITY_SECONDS
} from '@/lib/constants';
import { parseUnits, formatUnits } from 'viem';
import { publicClient } from '@/lib/viem';

// Fallback approximate XAUT price in USDT (1 troy oz of gold ~ $5100 as of Jan 2026)
// Only used if DEX quote fails - real price comes from Camelot V3 quoter
const MOCK_XAUT_PRICE_USDT = 5100;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usdtAmount = searchParams.get('amount');

    console.log('[Quote API] Request received, amount:', usdtAmount);

    if (!usdtAmount || isNaN(Number(usdtAmount)) || Number(usdtAmount) <= 0) {
      console.log('[Quote API] Invalid amount');
      return NextResponse.json(
        { success: false, error: 'Invalid USDT amount' },
        { status: 400 }
      );
    }

    // Parse USDT amount to bigint
    const usdtAmountBigInt = parseUnits(usdtAmount, USDT_DECIMALS);
    console.log('[Quote API] USDT amount bigint:', usdtAmountBigInt.toString());

    let expectedXautBigInt: bigint;
    let usedMockQuote = false;

    // Try to get quote from DEX
    try {
      console.log('[Quote API] Attempting to get DEX quote...');
      console.log('[Quote API] Quoter address:', '0x0Fc73040b26E9bC8514fA028D998E73A254Fa76E');
      console.log('[Quote API] Token In (USDT):', '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9');
      console.log('[Quote API] Token Out (XAUT0):', '0x40461291347e1eCbb09499F3371D3f17f10d7159');
      expectedXautBigInt = await getUsdtToXautQuote(usdtAmountBigInt);
      console.log('[Quote API] DEX quote successful:', expectedXautBigInt.toString());
    } catch (dexError: unknown) {
      console.error('[Quote API] DEX quote failed:', dexError);
      if (dexError instanceof Error) {
        console.error('[Quote API] Error message:', dexError.message);
        console.error('[Quote API] Error stack:', dexError.stack);
      }
      console.log('[Quote API] Using mock quote for development...');

      // Use mock quote based on approximate gold price
      // XAUT has 6 decimals, so we calculate: (usdtAmount / goldPrice) * 10^6
      const usdtAmountNum = Number(usdtAmount);
      const xautAmount = usdtAmountNum / MOCK_XAUT_PRICE_USDT;
      expectedXautBigInt = parseUnits(xautAmount.toFixed(6), XAUT_DECIMALS);
      usedMockQuote = true;
      console.log('[Quote API] Mock XAUT amount:', expectedXautBigInt.toString());
    }

    const expectedXautAmount = formatUnits(expectedXautBigInt, XAUT_DECIMALS);
    console.log('[Quote API] Expected XAUT amount:', expectedXautAmount);

    // Calculate minimum output with slippage
    const slippageMultiplier = BigInt(Math.floor((1 - SLIPPAGE_TOLERANCE) * 10000));
    const minAmountOutBigInt = (expectedXautBigInt * slippageMultiplier) / BigInt(10000);
    const minAmountOut = formatUnits(minAmountOutBigInt, XAUT_DECIMALS);

    // Convert to grams (1 XAUT = 1 troy ounce)
    const expectedGrams = Number(expectedXautAmount) * GRAMS_PER_OUNCE;

    // Estimate gas
    let gasEstimate = '0.0005'; // Default estimate
    try {
      const gasPrice = await publicClient.getGasPrice();
      const estimatedGas = BigInt(250000);
      gasEstimate = formatUnits(gasPrice * estimatedGas, 18);
    } catch (gasError) {
      console.error('[Quote API] Gas estimation failed:', gasError);
    }

    // Calculate approximate price impact (simplified)
    const priceImpact = 0.1;

    const response = {
      success: true,
      data: {
        usdtAmount,
        expectedXautAmount,
        expectedGrams,
        priceImpact,
        minAmountOut,
        slippage: SLIPPAGE_TOLERANCE * 100,
        gasEstimate,
        validUntil: new Date(Date.now() + QUOTE_VALIDITY_SECONDS * 1000),
        _mock: usedMockQuote, // Flag to indicate if mock quote was used
      },
    };

    console.log('[Quote API] Returning response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('[Quote API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get quote' },
      { status: 500 }
    );
  }
}
