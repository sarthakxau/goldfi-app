import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET /api/user - Get current user profile
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('privy_user_id', auth.privyUserId)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user with mock extended profile data
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        privyUserId: user.privy_user_id,
        walletAddress: user.wallet_address,
        email: user.email,
        phone: user.phone,
        kycStatus: user.kyc_status,
        // Mock extended profile data
        fullName: 'Abhishek Vaidyanathan',
        address: 'Mumbai, Maharashtra',
        pan: 'ABCDE1234F',
        aadhar: '1234 5678 9012',
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

// PATCH /api/user - Update user profile
export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, email, phone, address } = body;

    // For now, just return success (mock update)
    // In the future, this will update the database
    return NextResponse.json({
      success: true,
      data: {
        message: 'Profile updated successfully',
        updatedFields: { fullName, email, phone, address },
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
