// Preset gift INR amounts
export const GIFT_PRESET_INR = [500, 1000, 2500, 5000];

// Calculate INR to grams using live price
export function calculateGramsFromInr(inrAmount: number, pricePerGramInr: number): number {
  if (!pricePerGramInr || pricePerGramInr <= 0) return 0;
  return Number((inrAmount / pricePerGramInr).toFixed(4));
}
