import prisma from '@/lib/prisma';
import { TX_STATUS } from '@/lib/constants';
import { swapUsdtToXaut, swapXautToUsdt, transferXaut } from './dexService';
import { createOnmetaPayout } from './onmetaService';
import { parseUnits } from 'viem';
import Decimal from 'decimal.js';

// Process a completed buy payment
export async function processBuyTransaction(transactionId: string): Promise<void> {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { user: true },
  });

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  if (transaction.status !== TX_STATUS.PROCESSING) {
    throw new Error('Transaction is not in processing state');
  }

  try {
    // 1. Swap USDT to XAUT on Camelot DEX
    const usdtAmount = parseUnits(
      new Decimal(transaction.usdtAmount || 0).toString(),
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
      new Decimal(transaction.xautAmount || 0).toString(),
      6
    );

    const transferTxHash = await transferXaut(xautAmount, transaction.user.walletAddress);

    // 3. Update transaction and holdings
    await prisma.$transaction(async (tx) => {
      // Update transaction
      await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: TX_STATUS.COMPLETED,
          dexSwapTxHash: swapTxHash,
          blockchainTxHash: transferTxHash,
          completedAt: new Date(),
        },
      });

      // Update holdings
      const holding = await tx.holding.findUnique({
        where: { userId: transaction.userId },
      });

      const txXautAmount = new Decimal(transaction.xautAmount || 0);
      const txInrAmount = new Decimal(transaction.inrAmount || 0);

      if (holding) {
        const currentAmount = new Decimal(holding.xautAmount);
        const currentInvested = new Decimal(holding.totalInvestedInr);
        const newAmount = currentAmount.plus(txXautAmount);
        const newInvested = currentInvested.plus(txInrAmount);
        const newAvgPrice = newInvested.dividedBy(newAmount);

        await tx.holding.update({
          where: { userId: transaction.userId },
          data: {
            xautAmount: newAmount.toDecimalPlaces(6),
            totalInvestedInr: newInvested.toDecimalPlaces(2),
            avgBuyPriceInr: newAvgPrice.toDecimalPlaces(2),
          },
        });
      } else {
        await tx.holding.create({
          data: {
            userId: transaction.userId,
            xautAmount: txXautAmount.toDecimalPlaces(6),
            totalInvestedInr: txInrAmount.toDecimalPlaces(2),
            avgBuyPriceInr: new Decimal(transaction.goldPriceInr || 0).toDecimalPlaces(2),
          },
        });
      }
    });

    console.log(`Buy transaction ${transactionId} completed successfully`);
  } catch (error) {
    console.error(`Buy transaction ${transactionId} failed:`, error);

    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TX_STATUS.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Transaction processing failed',
      },
    });

    throw error;
  }
}

// Process a sell transaction after user transfers XAUT
export async function processSellTransaction(transactionId: string): Promise<void> {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { user: true },
  });

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  if (transaction.status !== TX_STATUS.PROCESSING) {
    throw new Error('Transaction is not in processing state');
  }

  try {
    // 1. Swap XAUT to USDT on Camelot DEX
    const xautAmount = parseUnits(
      new Decimal(transaction.xautAmount || 0).toString(),
      6
    );

    const treasuryAddress = process.env.TREASURY_WALLET_ADDRESS;
    if (!treasuryAddress) {
      throw new Error('Treasury address not configured');
    }

    const swapTxHash = await swapXautToUsdt(xautAmount, treasuryAddress);

    // 2. Create Onmeta payout order (USDT -> INR to user's bank)
    const payoutResult = await createOnmetaPayout({
      amount: new Decimal(transaction.usdtAmount || 0).toNumber(),
      currency: 'USDT',
      bankAccountId: transaction.user.id, // In production, use actual bank account ID
      orderId: transaction.id,
    });

    if (!payoutResult.success) {
      throw new Error(payoutResult.error || 'Failed to create payout');
    }

    // 3. Update transaction and holdings
    await prisma.$transaction(async (tx) => {
      // Update transaction
      await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: TX_STATUS.COMPLETED,
          dexSwapTxHash: swapTxHash,
          onmetaOrderId: payoutResult.orderId,
          completedAt: new Date(),
        },
      });

      // Update holdings
      const holding = await tx.holding.findUnique({
        where: { userId: transaction.userId },
      });

      if (holding) {
        const currentAmount = new Decimal(holding.xautAmount);
        const currentInvested = new Decimal(holding.totalInvestedInr);
        const txXautAmount = new Decimal(transaction.xautAmount || 0);

        const newAmount = currentAmount.minus(txXautAmount);
        const soldProportion = txXautAmount.dividedBy(currentAmount);
        const investedReduction = currentInvested.times(soldProportion);
        const newInvested = currentInvested.minus(investedReduction);

        await tx.holding.update({
          where: { userId: transaction.userId },
          data: {
            xautAmount: newAmount.toDecimalPlaces(6),
            totalInvestedInr: newInvested.toDecimalPlaces(2),
            avgBuyPriceInr: newAmount.isZero()
              ? null
              : newInvested.dividedBy(newAmount).toDecimalPlaces(2),
          },
        });
      }
    });

    console.log(`Sell transaction ${transactionId} completed successfully`);
  } catch (error) {
    console.error(`Sell transaction ${transactionId} failed:`, error);

    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TX_STATUS.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Transaction processing failed',
      },
    });

    throw error;
  }
}
