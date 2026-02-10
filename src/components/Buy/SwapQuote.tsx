import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { formatGrams } from '@/lib/utils';
import { GRAMS_PER_OUNCE } from '@/lib/constants';
import type { SwapQuote } from '@/types';
import { useTheme } from '@/lib/theme';
import { FADE_UP, DURATION } from '@/lib/animations';

interface SwapQuoteDisplayProps {
  quote: SwapQuote | null;
  loading: boolean;
}

export function SwapQuoteDisplay({ quote, loading }: SwapQuoteDisplayProps) {
  const { isDark } = useTheme();
  const SUCCESS = '#10B981';

  if (loading) {
    return (
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing' as const, duration: DURATION.fast }}
      >
        <View
          style={{
            backgroundColor: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: 80,
              height: 16,
              borderRadius: 4,
              backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.12)',
              marginBottom: 8,
            }}
          />
          <View
            style={{
              width: 128,
              height: 24,
              borderRadius: 4,
              backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.12)',
            }}
          />
        </View>
      </MotiView>
    );
  }

  if (!quote) return null;

  const minGrams = Number(quote.minAmountOut) * GRAMS_PER_OUNCE;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing' as const, duration: DURATION.normal }}
    >
      <View
        style={{
          backgroundColor: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 11, color: SUCCESS, marginBottom: 4 }}>
          You will receive approximately
        </Text>
        <Text
          style={{
            fontSize: 22,
            fontWeight: '700',
            color: isDark ? SUCCESS : '#065F46',
          }}
        >
          {formatGrams(quote.expectedGrams)}
        </Text>
        <View style={{ marginTop: 8, gap: 4 }}>
          <Text style={{ fontSize: 11, color: SUCCESS }}>
            Min. output: {formatGrams(minGrams)}
          </Text>
          <Text style={{ fontSize: 11, color: SUCCESS }}>
            Slippage: {quote.slippage}%
          </Text>
          <Text style={{ fontSize: 11, color: SUCCESS }}>
            Est. gas: ~{parseFloat(quote.gasEstimate).toFixed(6)} ETH
          </Text>
        </View>
      </View>
    </MotiView>
  );
}
