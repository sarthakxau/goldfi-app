import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import supabase from '@/lib/supabase';
import { claimGift } from '@/services/giftService';

export async function POST(request: NextRequest) {
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
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { claimToken } = body;

    if (!claimToken) {
      return NextResponse.json(
        { success: false, error: 'Claim token is required' },
        { status: 400 }
      );
    }

    const result = await claimGift(claimToken, user.id);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Gift claim error:', error);
    const message = error instanceof Error ? error.message : 'Failed to claim gift';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
