import { publicClient, getTreasuryWalletClient, ERC20_ABI } from '@/lib/viem';
import { CONTRACTS, SLIPPAGE_TOLERANCE, MAX_GAS_ETH } from '@/lib/constants';
import { parseUnits, formatUnits } from 'viem';

// Camelot V3 Router ABI (simplified - add full ABI in production)
const CAMELOT_ROUTER_ABI = [
  {
    name: 'exactInputSingle',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'recipient', type: 'address' },
          { name: 'deadline', type: 'uint256' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'limitSqrtPrice', type: 'uint160' },
        ],
      },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
] as const;

// Camelot V3 Quoter ABI (Algebra-based)
// Note: Algebra quoter returns (amountOut, fee) not the extended tuple
const CAMELOT_QUOTER_ABI = [
  {
    name: 'quoteExactInputSingle',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'limitSqrtPrice', type: 'uint160' },
    ],
    outputs: [
      { name: 'amountOut', type: 'uint256' },
      { name: 'fee', type: 'uint16' },
    ],
  },
] as const;

// Get quote for USDT -> XAUT swap
export async function getUsdtToXautQuote(usdtAmount: bigint): Promise<bigint> {
  try {
    console.log('[dexService] Getting quote for USDT -> XAUT');
    console.log('[dexService] USDT amount:', usdtAmount.toString());
    console.log('[dexService] Quoter address:', CONTRACTS.CAMELOT_V3_QUOTER);
    console.log('[dexService] USDT address:', CONTRACTS.USDT);
    console.log('[dexService] XAUT0 address:', CONTRACTS.XAUT0);

    // Quoter functions are nonpayable but meant to be simulated via eth_call
    const { result } = await publicClient.simulateContract({
      address: CONTRACTS.CAMELOT_V3_QUOTER as `0x${string}`,
      abi: CAMELOT_QUOTER_ABI,
      functionName: 'quoteExactInputSingle',
      args: [
        CONTRACTS.USDT as `0x${string}`,
        CONTRACTS.XAUT0 as `0x${string}`,
        usdtAmount,
        BigInt(0), // No price limit
      ],
    });

    console.log('[dexService] Quote result:', result);
    // Result is [amountOut, fee] for Algebra quoter
    return result[0];
  } catch (error) {
    console.error('[dexService] Quote error:', error);
    if (error instanceof Error) {
      console.error('[dexService] Error message:', error.message);
    }
    throw new Error('Failed to get swap quote');
  }
}

// Get quote for XAUT -> USDT swap
export async function getXautToUsdtQuote(xautAmount: bigint): Promise<bigint> {
  try {
    console.log('[dexService] Getting quote for XAUT -> USDT');
    console.log('[dexService] XAUT amount:', xautAmount.toString());

    // Quoter functions are nonpayable but meant to be simulated via eth_call
    const { result } = await publicClient.simulateContract({
      address: CONTRACTS.CAMELOT_V3_QUOTER as `0x${string}`,
      abi: CAMELOT_QUOTER_ABI,
      functionName: 'quoteExactInputSingle',
      args: [
        CONTRACTS.XAUT0 as `0x${string}`,
        CONTRACTS.USDT as `0x${string}`,
        xautAmount,
        BigInt(0),
      ],
    });

    console.log('[dexService] Quote result:', result);
    return result[0];
  } catch (error) {
    console.error('[dexService] Quote error:', error);
    if (error instanceof Error) {
      console.error('[dexService] Error message:', error.message);
    }
    throw new Error('Failed to get swap quote');
  }
}

// Execute USDT -> XAUT swap
export async function swapUsdtToXaut(
  usdtAmount: bigint,
  recipientAddress: string
): Promise<string> {
  const walletClient = getTreasuryWalletClient();
  const treasuryAddress = process.env.TREASURY_WALLET_ADDRESS as `0x${string}`;

  // Check gas price
  const gasPrice = await publicClient.getGasPrice();
  const maxGasWei = parseUnits(MAX_GAS_ETH.toString(), 18);
  if (gasPrice > maxGasWei) {
    throw new Error('Gas price too high, please try again later');
  }

  // Check allowance and approve if needed
  const allowance = await publicClient.readContract({
    address: CONTRACTS.USDT,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [treasuryAddress, CONTRACTS.CAMELOT_V3_ROUTER],
  });

  if (allowance < usdtAmount) {
    const approveHash = await walletClient.writeContract({
      address: CONTRACTS.USDT,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.CAMELOT_V3_ROUTER, usdtAmount * BigInt(2)],
    });

    await publicClient.waitForTransactionReceipt({ hash: approveHash });
  }

  // Get quote and calculate minimum output
  const expectedOutput = await getUsdtToXautQuote(usdtAmount);
  const minOutput = (expectedOutput * BigInt(Math.floor((1 - SLIPPAGE_TOLERANCE) * 10000))) / BigInt(10000);

  // Execute swap
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 300); // 5 minutes

  const hash = await walletClient.writeContract({
    address: CONTRACTS.CAMELOT_V3_ROUTER,
    abi: CAMELOT_ROUTER_ABI,
    functionName: 'exactInputSingle',
    args: [
      {
        tokenIn: CONTRACTS.USDT,
        tokenOut: CONTRACTS.XAUT0,
        recipient: recipientAddress as `0x${string}`,
        deadline,
        amountIn: usdtAmount,
        amountOutMinimum: minOutput,
        limitSqrtPrice: BigInt(0),
      },
    ],
  });

  // Wait for confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status !== 'success') {
    throw new Error('Swap transaction failed');
  }

  return hash;
}

// Execute XAUT -> USDT swap
export async function swapXautToUsdt(
  xautAmount: bigint,
  recipientAddress: string
): Promise<string> {
  const walletClient = getTreasuryWalletClient();
  const treasuryAddress = process.env.TREASURY_WALLET_ADDRESS as `0x${string}`;

  // Check gas price
  const gasPrice = await publicClient.getGasPrice();
  const maxGasWei = parseUnits(MAX_GAS_ETH.toString(), 18);
  if (gasPrice > maxGasWei) {
    throw new Error('Gas price too high, please try again later');
  }

  // Check allowance and approve if needed
  const allowance = await publicClient.readContract({
    address: CONTRACTS.XAUT0,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [treasuryAddress, CONTRACTS.CAMELOT_V3_ROUTER],
  });

  if (allowance < xautAmount) {
    const approveHash = await walletClient.writeContract({
      address: CONTRACTS.XAUT0,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.CAMELOT_V3_ROUTER, xautAmount * BigInt(2)],
    });

    await publicClient.waitForTransactionReceipt({ hash: approveHash });
  }

  // Get quote and calculate minimum output
  const expectedOutput = await getXautToUsdtQuote(xautAmount);
  const minOutput = (expectedOutput * BigInt(Math.floor((1 - SLIPPAGE_TOLERANCE) * 10000))) / BigInt(10000);

  // Execute swap
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);

  const hash = await walletClient.writeContract({
    address: CONTRACTS.CAMELOT_V3_ROUTER,
    abi: CAMELOT_ROUTER_ABI,
    functionName: 'exactInputSingle',
    args: [
      {
        tokenIn: CONTRACTS.XAUT0,
        tokenOut: CONTRACTS.USDT,
        recipient: recipientAddress as `0x${string}`,
        deadline,
        amountIn: xautAmount,
        amountOutMinimum: minOutput,
        limitSqrtPrice: BigInt(0),
      },
    ],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status !== 'success') {
    throw new Error('Swap transaction failed');
  }

  return hash;
}

// Transfer XAUT from treasury to user
export async function transferXaut(
  amount: bigint,
  toAddress: string
): Promise<string> {
  const walletClient = getTreasuryWalletClient();

  const hash = await walletClient.writeContract({
    address: CONTRACTS.XAUT0,
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [toAddress as `0x${string}`, amount],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status !== 'success') {
    throw new Error('Transfer failed');
  }

  return hash;
}

// Get XAUT balance for an address
export async function getXautBalance(address: string): Promise<bigint> {
  return publicClient.readContract({
    address: CONTRACTS.XAUT0,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  });
}
