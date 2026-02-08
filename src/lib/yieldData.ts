import { YieldStrategy, YieldPosition } from '@/types';

export const MOCK_STRATEGIES: YieldStrategy[] = [
  {
    id: 'aave-xaut-collateral',
    protocol: 'Aave V3',
    chain: 'Ethereum',
    name: 'XAUT Collateral Yield',
    apy: 3.1,
    tvl: '$18.7M',
    description:
      'Deposit XAUT (Tether Gold — physical gold in Swiss vaults, LBMA Good Delivery bars) as collateral on Aave V3. Borrow USDC at variable rates and deploy into yield vaults for the spread.',
    risk: 'Low',
    tokens: [
      { symbol: 'XAUT', name: 'Tether Gold', iconType: 'gold' },
      { symbol: 'USDC', name: 'USD Coin', iconType: 'dollar' },
    ],
    iconType: 'landmark',
    minDeposit: '0.1 XAUT',
    lockPeriod: 'None — withdraw anytime',
    liquidationRisk:
      '75% LTV — liquidation if XAUT price drops 25%+ relative to borrow',
    steps: [
      'Deposit XAUT as collateral on Aave V3 (1 XAUT = 1 troy oz gold)',
      'Borrow USDC at variable rate (~2.8% APR)',
      'Deploy borrowed USDC to Aave stablecoin supply for ~4.5% APY',
      'Net yield = stablecoin APY - borrow cost + AAVE token incentives',
    ],
    externalUrl: 'https://app.aave.com',
    quickAmounts: ['0.05', '0.1', '0.25', '0.5'],
  },
  {
    id: 'fluid-gold-lending',
    protocol: 'Fluid',
    chain: 'Ethereum',
    name: 'Fluid Gold Lending',
    apy: 5.4,
    tvl: '$8.3M',
    description:
      "Supply XAUT to Fluid's isolated gold lending market. Borrowers post ETH/stablecoins as collateral to access gold-backed liquidity. Lenders earn interest + FLUID token incentives.",
    risk: 'Medium',
    tokens: [{ symbol: 'XAUT', name: 'Tether Gold', iconType: 'gold' }],
    iconType: 'droplets',
    minDeposit: '0.05 XAUT',
    lockPeriod: 'None — withdraw anytime',
    liquidationRisk:
      'Isolated market — risk limited to supplied XAUT. Borrower liquidations protect lenders.',
    steps: [
      'Supply XAUT to the Fluid isolated lending pool',
      'Borrowers deposit ETH/USDC as collateral and borrow your XAUT',
      'Earn variable interest from borrowers + FLUID token rewards',
    ],
    externalUrl: 'https://fluid.instadapp.io',
    quickAmounts: ['0.05', '0.1', '0.25', '0.5'],
  },
  {
    id: 'camelot-xaut-usdt',
    protocol: 'Camelot DEX',
    chain: 'Arbitrum',
    name: 'XAUT/USDT Liquidity',
    apy: 8.7,
    tvl: '$4.6M',
    description:
      'Provide concentrated liquidity to the XAUT/USDT pool on Camelot V3. Earn trading fees from every swap plus GRAIL token incentives. Higher yield, but requires active range management.',
    risk: 'High',
    tokens: [
      { symbol: 'XAUT', name: 'Tether Gold', iconType: 'gold' },
      { symbol: 'USDT', name: 'Tether USD', iconType: 'dollar' },
    ],
    iconType: 'layers',
    minDeposit: '0.1 XAUT',
    lockPeriod: 'None — withdraw anytime',
    liquidationRisk:
      'Impermanent loss risk — if XAUT price moves significantly vs USDT, your position value may decrease relative to holding.',
    steps: [
      'Deposit XAUT + USDT in a concentrated price range on Camelot V3',
      'Earn swap fees from every trade that crosses your range',
      'Collect GRAIL token incentives as bonus yield',
    ],
    externalUrl: 'https://app.camelot.exchange',
    quickAmounts: ['0.05', '0.1', '0.25', '0.5'],
  },
];

export const MOCK_POSITIONS: YieldPosition[] = [
  {
    strategyId: 'aave-xaut-collateral',
    deposited: 0.5,
    depositToken: 'XAUT',
    earned: 98.4,
    apy: 3.1,
    days: 45,
    status: 'Active',
  },
  {
    strategyId: 'fluid-gold-lending',
    deposited: 0.3,
    depositToken: 'XAUT',
    earned: 67.3,
    apy: 5.4,
    days: 22,
    status: 'Active',
  },
];

export const TOTAL_EARNINGS = MOCK_POSITIONS.reduce(
  (sum, p) => sum + p.earned,
  0
);

export function getStrategyById(id: string): YieldStrategy | undefined {
  return MOCK_STRATEGIES.find((s) => s.id === id);
}

export function getPositionForStrategy(
  strategyId: string
): YieldPosition | undefined {
  return MOCK_POSITIONS.find((p) => p.strategyId === strategyId);
}
