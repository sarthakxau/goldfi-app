import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import supabase from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth();

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { walletAddress, email } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('privy_user_id', authUser.privyUserId)
      .single();

    let user;

    if (existingUser) {
      // Update existing user if wallet/email changed
      const updates: Record<string, unknown> = {};
      if (existingUser.wallet_address !== walletAddress) {
        updates.wallet_address = walletAddress;
      }
      if (email && existingUser.email !== email) {
        updates.email = email;
      }

      if (Object.keys(updates).length > 0) {
        const { data: updatedUser, error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', existingUser.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating user:', error);
          return NextResponse.json(
            { success: false, error: 'Failed to update user' },
            { status: 500 }
          );
        }
        user = updatedUser;
      } else {
        user = existingUser;
      }
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          privy_user_id: authUser.privyUserId,
          wallet_address: walletAddress,
          email: email || null,
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

      // Create default holding for new user
      const { error: holdingError } = await supabase.from('holdings').insert({
        user_id: user.id,
        xaut_amount: 0,
        total_invested_inr: 0,
      });

      if (holdingError) {
        console.error('Error creating holding:', holdingError);
        // Non-fatal - user still created
      }
    }

    // Ensure holding exists (for users created before this logic)
    const { data: holding } = await supabase
      .from('holdings')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!holding) {
      await supabase.from('holdings').insert({
        user_id: user.id,
        xaut_amount: 0,
        total_invested_inr: 0,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        privyUserId: user.privy_user_id,
        walletAddress: user.wallet_address,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Auth sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}
