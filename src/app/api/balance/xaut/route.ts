import { NextRequest, NextResponse } from 'next/server';
import { publicClient, ERC20_ABI } from '@/lib/viem';
import { CONTRACTS, XAUT_DECIMALS, GRAMS_PER_OUNCE } from '@/lib/constants';
import { formatUnits } from 'viem';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address || !address.startsWith('0x')) {
      return NextResponse.json(
        { success: false, error: 'Invalid address' },
        { status: 400 }
      );
    }

    const balanceRaw = await publicClient.readContract({
      address: CONTRACTS.XAUT0 as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    });

    const balance = formatUnits(balanceRaw, XAUT_DECIMALS);
    const balanceGrams = parseFloat(balance) * GRAMS_PER_OUNCE;

    return NextResponse.json({
      success: true,
      data: {
        balance,           // XAUT amount (troy ounces)
        balanceRaw: balanceRaw.toString(),
        balanceGrams,      // Converted to grams
      },
    });
  } catch (error) {
    console.error('XAUT balance fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch XAUT balance' },
      { status: 500 }
    );
  }
}
