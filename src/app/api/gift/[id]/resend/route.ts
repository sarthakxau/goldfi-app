import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import supabase from '@/lib/supabase';
import { resendClaimEmail } from '@/services/giftService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: giftId } = await params;

    const result = await resendClaimEmail(giftId, user.id);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Gift resend error:', error);
    const message = error instanceof Error ? error.message : 'Failed to resend gift email';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
