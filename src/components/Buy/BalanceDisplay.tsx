import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';
import { RefreshCw } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { FADE_UP, DURATION } from '@/lib/animations';

interface BalanceDisplayProps {
  balance: string | null;
  loading: boolean;
  onRefresh: () => void;
}

export function BalanceDisplay({ balance, loading, onRefresh }: BalanceDisplayProps) {
  const { colors, isDark } = useTheme();

  return (
    <MotiView
      {...FADE_UP}
      transition={{ type: 'timing' as const, duration: DURATION.normal }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: isDark ? '#242424' : '#F0F0F0',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <View>
          <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>
            Your USDT Balance
          </Text>
          {loading ? (
            <View
              style={{
                width: 96,
                height: 22,
                borderRadius: 6,
                backgroundColor: isDark ? '#2D2D2D' : '#D1D5DB',
              }}
            />
          ) : (
            <Text style={{ fontSize: 17, fontWeight: '600', color: colors.textPrimary }}>
              {balance ? `${parseFloat(balance).toFixed(2)} USDT` : '0.00 USDT'}
            </Text>
          )}
        </View>
        <Pressable onPress={onRefresh} disabled={loading} hitSlop={8}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.textMuted} />
          ) : (
            <RefreshCw size={16} color={colors.textMuted} />
          )}
        </Pressable>
      </View>
    </MotiView>
  );
}
