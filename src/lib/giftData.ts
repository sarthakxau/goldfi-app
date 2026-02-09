import { GiftPresetAmount } from '@/types';

// Preset gift amounts with corresponding gold grams
export const GIFT_PRESET_AMOUNTS: GiftPresetAmount[] = [
  { inrAmount: 500, gramsAmount: 0.07 },
  { inrAmount: 1000, gramsAmount: 0.14 },
  { inrAmount: 2500, gramsAmount: 0.34 },
  { inrAmount: 5000, gramsAmount: 0.69 },
];

// Calculate INR to grams based on preset rates
export function calculateGramsFromInr(inrAmount: number): number {
  // Approximate calculation: ₹500 = 0.07g, so rate is ~₹7,142 per gram
  const ratePerGram = 7142;
  return Number((inrAmount / ratePerGram).toFixed(2));
}
