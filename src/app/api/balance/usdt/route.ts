import { NextRequest, NextResponse } from 'next/server';
import { publicClient, ERC20_ABI } from '@/lib/viem';
import { CONTRACTS, USDT_DECIMALS } from '@/lib/constants';
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
      address: CONTRACTS.USDT,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    });

    const balance = formatUnits(balanceRaw, USDT_DECIMALS);

    return NextResponse.json({
      success: true,
      data: {
        balance,
        balanceRaw: balanceRaw.toString(),
      },
    });
  } catch (error) {
    console.error('Balance fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
