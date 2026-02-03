import supabase from '@/lib/supabase';
import { TX_STATUS } from '@/lib/constants';
import { swapUsdtToXaut, swapXautToUsdt, transferXaut } from './dexService';
import { createOnmetaPayout } from './onmetaService';
import { parseUnits } from 'viem';
import Decimal from 'decimal.js';

// Process a completed buy payment
export async function processBuyTransaction(transactionId: string): Promise<void> {
  // Fetch transaction with user
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .select('*, users(*)')
    .eq('id', transactionId)
    .single();

  if (txError || !transaction) {
    throw new Error('Transaction not found');
  }

  if (transaction.status !== TX_STATUS.PROCESSING) {
    throw new Error('Transaction is not in processing state');
  }

  const user = transaction.users;
  if (!user) {
    throw new Error('User not found for transaction');
  }

  try {
    // 1. Swap USDT to XAUT on Camelot DEX
    const usdtAmount = parseUnits(
      new Decimal(transaction.usdt_amount || 0).toString(),
      6
    );

    const treasuryAddress = process.env.TREASURY_WALLET_ADDRESS;
    if (!treasuryAddress) {
      throw new Error('Treasury address not configured');
    }

    // Execute swap (XAUT goes to treasury first)
    const swapTxHash = await swapUsdtToXaut(usdtAmount, treasuryAddress);

    // 2. Transfer XAUT to user's wallet
    const xautAmount = parseUnits(
      new Decimal(transaction.xaut_amount || 0).toString(),
      6
    );

    const transferTxHash = await transferXaut(xautAmount, user.wallet_address);

    // 3. Update transaction
    await supabase
      .from('transactions')
      .update({
        status: TX_STATUS.COMPLETED,
        dex_swap_tx_hash: swapTxHash,
        blockchain_tx_hash: transferTxHash,
        completed_at: new Date().toISOString(),
      })
      .eq('id', transactionId);

    // 4. Update holdings
    const { data: holding } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', transaction.user_id)
      .single();

    const txXautAmount = new Decimal(transaction.xaut_amount || 0);
    const txInrAmount = new Decimal(transaction.inr_amount || 0);

    if (holding) {
      const currentAmount = new Decimal(holding.xaut_amount || 0);
      const currentInvested = new Decimal(holding.total_invested_inr || 0);
      const newAmount = currentAmount.plus(txXautAmount);
      const newInvested = currentInvested.plus(txInrAmount);
      const newAvgPrice = newInvested.dividedBy(newAmount);

      await supabase
        .from('holdings')
        .update({
          xaut_amount: newAmount.toNumber(),
          total_invested_inr: newInvested.toNumber(),
          avg_buy_price_inr: newAvgPrice.toNumber(),
        })
        .eq('user_id', transaction.user_id);
    } else {
      await supabase.from('holdings').insert({
        user_id: transaction.user_id,
        xaut_amount: txXautAmount.toNumber(),
        total_invested_inr: txInrAmount.toNumber(),
        avg_buy_price_inr: new Decimal(transaction.gold_price_inr || 0).toNumber(),
      });
    }

    console.log(`Buy transaction ${transactionId} completed successfully`);
  } catch (error) {
    console.error(`Buy transaction ${transactionId} failed:`, error);

    await supabase
      .from('transactions')
      .update({
        status: TX_STATUS.FAILED,
        error_message: error instanceof Error ? error.message : 'Transaction processing failed',
      })
      .eq('id', transactionId);

    throw error;
  }
}

// Process a sell transaction after user transfers XAUT
export async function processSellTransaction(transactionId: string): Promise<void> {
  // Fetch transaction with user
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .select('*, users(*)')
    .eq('id', transactionId)
    .single();

  if (txError || !transaction) {
    throw new Error('Transaction not found');
  }

  if (transaction.status !== TX_STATUS.PROCESSING) {
    throw new Error('Transaction is not in processing state');
  }

  const user = transaction.users;
  if (!user) {
    throw new Error('User not found for transaction');
  }

  try {
    // 1. Swap XAUT to USDT on Camelot DEX
    const xautAmount = parseUnits(
      new Decimal(transaction.xaut_amount || 0).toString(),
      6
    );

    const treasuryAddress = process.env.TREASURY_WALLET_ADDRESS;
    if (!treasuryAddress) {
      throw new Error('Treasury address not configured');
    }

    const swapTxHash = await swapXautToUsdt(xautAmount, treasuryAddress);

    // 2. Create Onmeta payout order (USDT -> INR to user's bank)
    const payoutResult = await createOnmetaPayout({
      amount: new Decimal(transaction.usdt_amount || 0).toNumber(),
      currency: 'USDT',
      bankAccountId: user.id, // In production, use actual bank account ID
      orderId: transaction.id,
    });

    if (!payoutResult.success) {
      throw new Error(payoutResult.error || 'Failed to create payout');
    }

    // 3. Update transaction
    await supabase
      .from('transactions')
      .update({
        status: TX_STATUS.COMPLETED,
        dex_swap_tx_hash: swapTxHash,
        onmeta_order_id: payoutResult.orderId,
        completed_at: new Date().toISOString(),
      })
      .eq('id', transactionId);

    // 4. Update holdings
    const { data: holding } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', transaction.user_id)
      .single();

    if (holding) {
      const currentAmount = new Decimal(holding.xaut_amount || 0);
      const currentInvested = new Decimal(holding.total_invested_inr || 0);
      const txXautAmount = new Decimal(transaction.xaut_amount || 0);

      const newAmount = currentAmount.minus(txXautAmount);
      const soldProportion = txXautAmount.dividedBy(currentAmount);
      const investedReduction = currentInvested.times(soldProportion);
      const newInvested = currentInvested.minus(investedReduction);

      await supabase
        .from('holdings')
        .update({
          xaut_amount: newAmount.toNumber(),
          total_invested_inr: newInvested.toNumber(),
          avg_buy_price_inr: newAmount.isZero()
            ? null
            : newInvested.dividedBy(newAmount).toNumber(),
        })
        .eq('user_id', transaction.user_id);
    }

    console.log(`Sell transaction ${transactionId} completed successfully`);
  } catch (error) {
    console.error(`Sell transaction ${transactionId} failed:`, error);

    await supabase
      .from('transactions')
      .update({
        status: TX_STATUS.FAILED,
        error_message: error instanceof Error ? error.message : 'Transaction processing failed',
      })
      .eq('id', transactionId);

    throw error;
  }
}
