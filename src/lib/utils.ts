import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Decimal from 'decimal.js';
import { GRAMS_PER_OUNCE } from './constants';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert troy ounces to grams
export function ouncesToGrams(ounces: number | string | Decimal): Decimal {
  return new Decimal(ounces).times(GRAMS_PER_OUNCE);
}

// Convert grams to troy ounces
export function gramsToOunces(grams: number | string | Decimal): Decimal {
  return new Decimal(grams).dividedBy(GRAMS_PER_OUNCE);
}

// Format INR currency
export function formatINR(amount: number | string | Decimal): string {
  const num = new Decimal(amount).toNumber();
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
}

// Format grams with proper precision
export function formatGrams(grams: number | string | Decimal): string {
  const num = new Decimal(grams);
  if (num.lessThan(0.001)) {
    return `${num.toFixed(3)} g`;
  }
  if (num.lessThan(1)) {
    return `${num.toFixed(4)} g`;
  }
  return `${num.toFixed(3)} g`;
}

// Format percentage
export function formatPercent(value: number | string | Decimal): string {
  const num = new Decimal(value).toNumber();
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

// Truncate wallet address
export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format date for display
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

// Calculate profit/loss percentage
export function calculatePnlPercent(
  currentValue: Decimal,
  investedValue: Decimal
): Decimal {
  if (investedValue.isZero()) return new Decimal(0);
  return currentValue.minus(investedValue).dividedBy(investedValue).times(100);
}

// Debounce function for input handling
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
