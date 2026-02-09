import { randomUUID } from 'crypto';
import supabase from '@/lib/supabase';
import type { DbGift } from '@/lib/supabase';
import { transferXaut } from '@/services/dexService';
import { sendGiftNotification, buildClaimUrl } from '@/services/emailService';
import { XAUT_DECIMALS, GRAMS_PER_OUNCE } from '@/lib/constants';
import { parseUnits } from 'viem';

const GIFT_EXPIRY_DAYS = parseInt(process.env.GIFT_EXPIRY_DAYS || '30', 10);

// ---------- Recipient Lookup ----------

export async function lookupRecipient(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (error || !data) {
    return { found: false as const };
  }

  return {
    found: true as const,
    user: { id: data.id as string, email: data.email as string },
  };
}

// ---------- Create Direct Gift (recipient exists) ----------

export async function createDirectGift(
  senderUserId: string,
  recipientUserId: string,
  data: {
    recipientEmail: string;
    recipientName?: string;
    xautAmount: number;
    inrAmount: number;
    goldPriceInr: number;
    gramsAmount: number;
    occasion: string;
    message?: string;
    paymentMethod: string;
    txHash: string;
  }
) {
  const { data: gift, error } = await supabase
    .from('gifts')
    .insert({
      sender_user_id: senderUserId,
      recipient_user_id: recipientUserId,
      recipient_email: data.recipientEmail.toLowerCase().trim(),
      recipient_name: data.recipientName || null,
      xaut_amount: data.xautAmount,
      inr_amount: data.inrAmount,
      gold_price_inr: data.goldPriceInr,
      grams_amount: data.gramsAmount,
      occasion: data.occasion,
      message: data.message || null,
      payment_method: data.paymentMethod,
      escrow_tx_hash: data.txHash,
      status: 'claimed',
      delivered_at: new Date().toISOString(),
      claimed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('[giftService] createDirectGift error:', error);
    throw new Error('Failed to create gift record');
  }

  // Update sender holdings (decrement)
  await updateHoldings(senderUserId, -data.xautAmount, -data.inrAmount);

  // Update recipient holdings (increment)
  await updateHoldings(recipientUserId, data.xautAmount, data.inrAmount);

  return gift as DbGift;
}

// ---------- Create Escrow Gift (recipient doesn't exist) ----------

export async function createEscrowGift(
  senderUserId: string,
  data: {
    recipientEmail: string;
    recipientName?: string;
    xautAmount: number;
    inrAmount: number;
    goldPriceInr: number;
    gramsAmount: number;
    occasion: string;
    message?: string;
    paymentMethod: string;
    txHash: string;
  }
) {
  const claimToken = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + GIFT_EXPIRY_DAYS);

  const { data: gift, error } = await supabase
    .from('gifts')
    .insert({
      sender_user_id: senderUserId,
      recipient_email: data.recipientEmail.toLowerCase().trim(),
      recipient_name: data.recipientName || null,
      xaut_amount: data.xautAmount,
      inr_amount: data.inrAmount,
      gold_price_inr: data.goldPriceInr,
      grams_amount: data.gramsAmount,
      occasion: data.occasion,
      message: data.message || null,
      payment_method: data.paymentMethod,
      escrow_tx_hash: data.txHash,
      claim_token: claimToken,
      status: 'delivered',
      expires_at: expiresAt.toISOString(),
      delivered_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('[giftService] createEscrowGift error:', error);
    throw new Error('Failed to create escrow gift record');
  }

  // Update sender holdings (decrement)
  await updateHoldings(senderUserId, -data.xautAmount, -data.inrAmount);

  // Send email notification
  const senderName = await getSenderName(senderUserId);
  const claimUrl = buildClaimUrl(claimToken);

  await sendGiftNotification({
    recipientEmail: data.recipientEmail,
    senderName,
    gramsAmount: data.gramsAmount,
    inrAmount: data.inrAmount,
    occasion: data.occasion,
    message: data.message,
    claimUrl,
  });

  return { gift: gift as DbGift, claimUrl };
}

// ---------- Claim Gift ----------

export async function claimGift(claimToken: string, claimerUserId: string) {
  // Fetch the gift by claim token
  const { data: gift, error: fetchError } = await supabase
    .from('gifts')
    .select('*')
    .eq('claim_token', claimToken)
    .single();

  if (fetchError || !gift) {
    throw new Error('Gift not found');
  }

  if (gift.status === 'claimed') {
    throw new Error('Gift has already been claimed');
  }

  if (gift.status === 'expired') {
    throw new Error('Gift has expired');
  }

  if (gift.expires_at && new Date(gift.expires_at) < new Date()) {
    // Mark as expired
    await supabase.from('gifts').update({ status: 'expired' }).eq('id', gift.id);
    throw new Error('Gift has expired');
  }

  // Get claimer's wallet address
  const { data: claimer } = await supabase
    .from('users')
    .select('id, wallet_address')
    .eq('id', claimerUserId)
    .single();

  if (!claimer) {
    throw new Error('User not found');
  }

  // Transfer XAUT from treasury to claimer
  const xautRaw = parseUnits(gift.xaut_amount.toString(), XAUT_DECIMALS);
  const claimTxHash = await transferXaut(xautRaw, claimer.wallet_address);

  // Update gift record
  const { data: updatedGift, error: updateError } = await supabase
    .from('gifts')
    .update({
      status: 'claimed',
      recipient_user_id: claimerUserId,
      claim_tx_hash: claimTxHash,
      claimed_at: new Date().toISOString(),
    })
    .eq('id', gift.id)
    .select()
    .single();

  if (updateError) {
    console.error('[giftService] claimGift update error:', updateError);
    throw new Error('Failed to update gift record');
  }

  // Update claimer's holdings (increment)
  await updateHoldings(claimerUserId, Number(gift.xaut_amount), Number(gift.inr_amount));

  return { gift: updatedGift as DbGift, txHash: claimTxHash };
}

// ---------- Get Sent / Received Gifts ----------

export async function getSentGifts(userId: string) {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('sender_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[giftService] getSentGifts error:', error);
    throw new Error('Failed to fetch sent gifts');
  }

  return (data || []) as DbGift[];
}

export async function getReceivedGifts(userId: string) {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('recipient_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[giftService] getReceivedGifts error:', error);
    throw new Error('Failed to fetch received gifts');
  }

  return (data || []) as DbGift[];
}

// ---------- Resend Claim Email ----------

export async function resendClaimEmail(giftId: string, senderUserId: string) {
  const { data: gift, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('id', giftId)
    .eq('sender_user_id', senderUserId)
    .single();

  if (error || !gift) {
    throw new Error('Gift not found');
  }

  if (gift.status !== 'delivered') {
    throw new Error('Gift is not in a resendable state');
  }

  if (!gift.claim_token || !gift.recipient_email) {
    throw new Error('Gift is missing claim token or recipient email');
  }

  const senderName = await getSenderName(senderUserId);
  const claimUrl = buildClaimUrl(gift.claim_token);

  await sendGiftNotification({
    recipientEmail: gift.recipient_email,
    senderName,
    gramsAmount: Number(gift.grams_amount),
    inrAmount: Number(gift.inr_amount),
    occasion: gift.occasion,
    message: gift.message || undefined,
    claimUrl,
  });

  return { success: true };
}

// ---------- Helpers ----------

async function getSenderName(userId: string): Promise<string> {
  const { data } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single();

  if (!data?.email) return 'Someone';

  // Use part before @ as display name
  return data.email.split('@')[0];
}

async function updateHoldings(userId: string, xautDelta: number, inrDelta: number) {
  const { data: holding } = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!holding) {
    // Create holdings if they don't exist (e.g. new user claiming a gift)
    await supabase.from('holdings').insert({
      user_id: userId,
      xaut_amount: Math.max(0, xautDelta),
      total_invested_inr: Math.max(0, inrDelta),
    });
    return;
  }

  const newXaut = Math.max(0, Number(holding.xaut_amount) + xautDelta);
  const newInvested = Math.max(0, Number(holding.total_invested_inr) + inrDelta);

  await supabase
    .from('holdings')
    .update({
      xaut_amount: newXaut,
      total_invested_inr: newInvested,
    })
    .eq('user_id', userId);
}
