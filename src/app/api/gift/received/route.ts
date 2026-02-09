import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import supabase from '@/lib/supabase';
import { getReceivedGifts } from '@/services/giftService';

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
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const gifts = await getReceivedGifts(user.id);

    return NextResponse.json({ success: true, data: gifts });
  } catch (error) {
    console.error('Get received gifts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch received gifts' },
      { status: 500 }
    );
  }
}
