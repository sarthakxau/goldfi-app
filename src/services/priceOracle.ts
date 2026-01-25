import redis from '@/lib/redis';
import supabase from '@/lib/supabase';
import { PRICE_CACHE_DURATION, GRAMS_PER_OUNCE, GRAMS_PER_TOLA } from '@/lib/constants';
import type { GoldPrice, TolaPrice } from '@/types';

const CACHE_KEY = 'gold:price:current';

interface CoinGeckoResponse {
  'tether-gold': {
    usd: number;
  };
}

interface ExchangeRateV4Response {
  rates: {
    INR: number;
  };
}

interface ExchangeRateV6Response {
  result: string;
  conversion_rates: {
    INR: number;
  };
}

// Fetch gold price from CoinGecko
async function fetchGoldPriceUsd(): Promise<number> {
  try {
    const apiKey = process.env.COINGECKO_API_KEY;
    const url = apiKey
      ? `https://api.coingecko.com/api/v3/simple/price?ids=tether-gold&vs_currencies=usd&x_cg_demo_api_key=${apiKey}`
      : 'https://api.coingecko.com/api/v3/simple/price?ids=tether-gold&vs_currencies=usd';

    const res = await fetch(url, { next: { revalidate: 60 } });

    if (!res.ok) {
      throw new Error('CoinGecko API error');
    }

    const data: CoinGeckoResponse = await res.json();
    return data['tether-gold'].usd;
  } catch (error) {
    console.error('Failed to fetch gold price from CoinGecko:', error);
    return 2650; // Fallback price
  }
}

// Fetch USD/INR exchange rate
async function fetchUsdInrRate(): Promise<number> {
  try {
    const apiKey = process.env.EXCHANGERATE_API_KEY;
    // Use v6 API with key if available, otherwise fall back to v4
    const url = apiKey
      ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
      : 'https://api.exchangerate-api.com/v4/latest/USD';

    const res = await fetch(url, { next: { revalidate: 300 } });

    if (!res.ok) {
      throw new Error('Exchange rate API error');
    }

    const data: ExchangeRateV6Response | ExchangeRateV4Response = await res.json();

    // v6 uses conversion_rates, v4 uses rates
    if ('conversion_rates' in data) {
      return data.conversion_rates.INR;
    }
    return data.rates.INR;
  } catch (error) {
    console.error('Failed to fetch USD/INR rate:', error);
    return 83.5; // Fallback rate
  }
}

// Get current gold price (with caching)
export async function getGoldPrice(): Promise<GoldPrice> {
  // Check cache first
  const cached = await redis.get(CACHE_KEY);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch fresh data
  const [priceUsd, usdInrRate] = await Promise.all([
    fetchGoldPriceUsd(),
    fetchUsdInrRate(),
  ]);

  const priceInr = priceUsd * usdInrRate;
  const pricePerGramUsd = priceUsd / GRAMS_PER_OUNCE;
  const pricePerGramInr = priceInr / GRAMS_PER_OUNCE;

  const price: GoldPrice = {
    priceUsd,
    priceInr,
    pricePerGramUsd,
    pricePerGramInr,
    usdInrRate,
    timestamp: new Date(),
  };

  // Cache the price
  await redis.set(CACHE_KEY, JSON.stringify(price), {
    ex: PRICE_CACHE_DURATION,
  });

  return price;
}

// Store price in history
export async function storePriceHistory(): Promise<void> {
  const price = await getGoldPrice();

  await supabase.from('price_history').insert({
    gold_price_usd: price.priceUsd,
    usd_inr_rate: price.usdInrRate,
    gold_price_inr: price.priceInr,
    source: 'coingecko',
  });
}

// Get price history for chart (last 7 days)
export async function getPriceHistory(days: number = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('price_history')
    .select('gold_price_inr, timestamp')
    .gte('timestamp', since.toISOString())
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching price history:', error);
    return [];
  }

  return (data || []).map((row) => ({
    goldPriceInr: row.gold_price_inr,
    timestamp: row.timestamp,
  }));
}

// Get gold price in tola units (1 tola = 10 grams)
export async function getTolaPrice(): Promise<TolaPrice> {
  const [priceUsd, usdInrRate] = await Promise.all([
    fetchGoldPriceUsd(),
    fetchUsdInrRate(),
  ]);

  // 1 tola = 10 grams = 10/31.1035 troy ounces
  const tolaInOunces = GRAMS_PER_TOLA / GRAMS_PER_OUNCE;
  const priceInrPerTola = priceUsd * usdInrRate * tolaInOunces;

  return {
    priceInrPerTola,
    priceUsd,
    usdInrRate,
    timestamp: new Date(),
  };
}
