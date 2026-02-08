import { GiftTransaction, GiftPresetAmount } from '@/types';

// Preset gift amounts with corresponding gold grams
export const GIFT_PRESET_AMOUNTS: GiftPresetAmount[] = [
  { inrAmount: 500, gramsAmount: 0.07 },
  { inrAmount: 1000, gramsAmount: 0.14 },
  { inrAmount: 2500, gramsAmount: 0.34 },
  { inrAmount: 5000, gramsAmount: 0.69 },
];

// Mock sent gifts
export const MOCK_SENT_GIFTS: GiftTransaction[] = [
  {
    id: 'gift-sent-1',
    type: 'sent',
    recipientName: "Riya",
    recipientPhone: '+91 98765 43210',
    gramsAmount: 0.5,
    inrAmount: 3642,
    message: 'Happy Birthday Riya! Wishing you a golden year ahead!',
    occasion: 'Birthday',
    status: 'delivered',
    createdAt: new Date('2026-01-15'),
    deliveredAt: new Date('2026-01-15'),
  },
  {
    id: 'gift-sent-2',
    type: 'sent',
    recipientName: "Mom",
    recipientPhone: '+91 98765 43211',
    gramsAmount: 1.0,
    inrAmount: 7284,
    message: 'Happy Diwali! May this festival bring you prosperity and joy.',
    occasion: 'Festival',
    status: 'delivered',
    createdAt: new Date('2025-11-01'),
    deliveredAt: new Date('2025-11-01'),
  },
  {
    id: 'gift-sent-3',
    type: 'sent',
    recipientName: "Rahul",
    recipientPhone: '+91 98765 43212',
    gramsAmount: 2.0,
    inrAmount: 14568,
    message: 'Congratulations on your wedding! Wishing you a lifetime of happiness.',
    occasion: 'Wedding',
    status: 'opened',
    createdAt: new Date('2025-12-20'),
    deliveredAt: new Date('2025-12-20'),
  },
];

// Mock received gifts
export const MOCK_RECEIVED_GIFTS: GiftTransaction[] = [
  {
    id: 'gift-received-1',
    type: 'received',
    senderName: "Dad",
    gramsAmount: 5.0,
    inrAmount: 36421,
    message: 'Happy New Year! Start the year with some gold in your vault.',
    occasion: 'Custom',
    status: 'added_to_vault',
    createdAt: new Date('2026-01-01'),
    deliveredAt: new Date('2026-01-01'),
    claimedAt: new Date('2026-01-01'),
  },
  {
    id: 'gift-received-2',
    type: 'received',
    senderName: "Priya",
    gramsAmount: 0.25,
    inrAmount: 1821,
    message: 'Happy Valentines Day!',
    occasion: 'Just Because',
    status: 'pending',
    createdAt: new Date('2026-02-14'),
    deliveredAt: new Date('2026-02-14'),
  },
];

// Helper function to get all gifts
export function getAllMockGifts(): GiftTransaction[] {
  return [...MOCK_SENT_GIFTS, ...MOCK_RECEIVED_GIFTS];
}

// Helper function to get gift by ID
export function getGiftById(id: string): GiftTransaction | undefined {
  return getAllMockGifts().find((gift) => gift.id === id);
}

// Helper function to get gifts by type
export function getGiftsByType(type: 'sent' | 'received'): GiftTransaction[] {
  return type === 'sent' ? MOCK_SENT_GIFTS : MOCK_RECEIVED_GIFTS;
}

// Calculate INR to grams based on preset rates
export function calculateGramsFromInr(inrAmount: number): number {
  // Approximate calculation: ₹500 = 0.07g, so rate is ~₹7,142 per gram
  const ratePerGram = 7142;
  return Number((inrAmount / ratePerGram).toFixed(2));
}
