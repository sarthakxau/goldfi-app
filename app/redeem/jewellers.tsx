import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react-native';

import { useTheme } from '@/lib/theme';
import { DURATION, FADE_UP, staggerDelay } from '@/lib/animations';

const GOLD_500 = '#B8860B';
const GOLD_100 = '#FFF0C2';

interface Jeweller {
  name: string;
  distance: string;
  address: string;
  rate: string;
}

const JEWELLERS: Jeweller[] = [
  {
    name: 'Tanishq - Connaught Place',
    distance: '1.2 km',
    address: 'Block N, Connaught Place, New Delhi 110001',
    rate: '8% p.a.',
  },
  {
    name: 'Kalyan Jewellers - Karol Bagh',
    distance: '2.8 km',
    address: '14/2, Ajmal Khan Road, Karol Bagh, New Delhi 110005',
    rate: '7.5% p.a.',
  },
  {
    name: 'Malabar Gold - Rajouri Garden',
    distance: '4.1 km',
    address: 'J-1/47, Rajouri Garden, New Delhi 110027',
    rate: '7% p.a.',
  },
  {
    name: 'PC Jeweller - Lajpat Nagar',
    distance: '5.5 km',
    address: '5, Central Market, Lajpat Nagar II, New Delhi 110024',
    rate: '8% p.a.',
  },
  {
    name: 'Joyalukkas - South Extension',
    distance: '6.3 km',
    address: 'K-18, South Extension Part II, New Delhi 110049',
    rate: '7.5% p.a.',
  },
];

export default function JewellersScreen() {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView {...FADE_UP}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              marginBottom: 8,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.borderSubtle,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <ArrowLeft size={20} color={colors.textPrimary} />
            </Pressable>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.textPrimary,
              }}
            >
              Nearby Jewellers
            </Text>
          </View>
        </MotiView>

        {/* Map Placeholder */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing', duration: DURATION.normal, delay: 60 }}
        >
          <View
            style={{
              width: '100%',
              height: 180,
              borderRadius: 16,
              overflow: 'hidden',
              marginBottom: 20,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Decorative radial background */}
            <View
              style={{
                position: 'absolute',
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: isDark
                  ? 'rgba(184,134,11,0.04)'
                  : 'rgba(184,134,11,0.06)',
              }}
            />

            {/* Decorative map dots */}
            <View
              style={{
                position: 'absolute',
                top: 32,
                left: 48,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: `${GOLD_500}66`,
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: 64,
                right: 80,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: `${GOLD_500}4D`,
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 48,
                left: 96,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: `${GOLD_500}40`,
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: 80,
                left: '50%',
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: `${GOLD_500}59`,
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 64,
                right: 64,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: `${GOLD_500}33`,
              }}
            />

            <MapPin size={32} color={GOLD_500} />
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: colors.textMuted,
                marginTop: 8,
              }}
            >
              New Delhi, India
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.textMuted,
                marginTop: 2,
              }}
            >
              showing jewellers within 10 km
            </Text>
          </View>
        </MotiView>

        {/* Section label */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing', duration: DURATION.normal, delay: 100 }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: colors.textMuted,
              marginBottom: 12,
            }}
          >
            PARTNER JEWELLERS
          </Text>
        </MotiView>

        {/* Jewellers List */}
        <View style={{ gap: 12 }}>
          {JEWELLERS.map((jeweller, index) => (
            <JewellerCard
              key={jeweller.name}
              jeweller={jeweller}
              index={index}
              isDark={isDark}
              colors={colors}
            />
          ))}
        </View>

        {/* Disclaimer */}
        <MotiView
          {...FADE_UP}
          transition={{ type: 'timing', duration: DURATION.normal, delay: 500 }}
        >
          <Text
            style={{
              fontSize: 11,
              color: colors.textMuted,
              textAlign: 'center',
              lineHeight: 16,
              marginTop: 24,
            }}
          >
            Rates are indicative and subject to change. Contact jewellers
            directly for final pricing and availability.
          </Text>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Jeweller Card ──────────────────────────────────

function JewellerCard({
  jeweller,
  index,
  isDark,
  colors,
}: {
  jeweller: Jeweller;
  index: number;
  isDark: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: DURATION.normal,
        delay: staggerDelay(index, 60, 140),
      }}
    >
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
        }}
      >
        {/* Top Row: Name + Rate */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: isDark ? 'rgba(184,134,11,0.1)' : GOLD_100,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MapPin size={16} color={GOLD_500} />
            </View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.textPrimary,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {jeweller.name}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: isDark ? 'rgba(184,134,11,0.1)' : GOLD_100,
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginLeft: 8,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: GOLD_500 }}>
              {jeweller.rate}
            </Text>
          </View>
        </View>

        {/* Address */}
        <View style={{ marginLeft: 40 }}>
          <Text
            style={{
              fontSize: 12,
              color: colors.textMuted,
              lineHeight: 16,
            }}
            numberOfLines={2}
          >
            {jeweller.address}
          </Text>

          {/* Distance */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              marginTop: 6,
            }}
          >
            <Navigation size={12} color={colors.textSecondary} />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '500',
                color: colors.textSecondary,
              }}
            >
              {jeweller.distance} away
            </Text>
          </View>
        </View>
      </View>
    </MotiView>
  );
}
