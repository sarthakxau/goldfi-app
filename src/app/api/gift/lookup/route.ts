import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { lookupRecipient } from '@/services/giftService';

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth();
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const email = request.nextUrl.searchParams.get('email');
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const result = await lookupRecipient(email);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Gift lookup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to look up recipient' },
      { status: 500 }
    );
  }
}
