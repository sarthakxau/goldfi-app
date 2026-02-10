import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import {
  Eye,
  MoreHorizontal,
  Receipt,
  X,
  Shield,
  MapPin,
  Scale,
  Gem,
  CreditCard,
} from 'lucide-react-native';

import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth-provider';
import { DURATION, FADE_UP, staggerDelay } from '@/lib/animations';
import { formatGrams } from '@/lib/utils';

const GOLD_500 = '#B8860B';

// Mock card data
const CARD_DATA = {
  weightGrams: 10,
  purity: '999.9',
  vaultLocation: 'Brinks, Singapore',
  cardNumber: '**** **** **** 4012',
  serialNumber: 'BLN-2024-00142',
};

export default function CardScreen() {
  const { isDark, colors } = useTheme();
  const { email } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const userName = email ? email.split('@')[0] : 'User';

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-surface-dark" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing' as const, duration: DURATION.normal }}
        >
          <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8 }}>
            <Text className="text-2xl font-bold text-text-primary dark:text-text-dark-primary tracking-tight">
              Your gold.fi card
            </Text>
          </View>
        </MotiView>

        <View style={{ paddingHorizontal: 24, paddingTop: 8, gap: 32 }}>
          {/* Gold Card */}
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing' as const,
              duration: DURATION.slow,
              delay: 80,
            }}
          >
            <View
              style={{
                borderRadius: 20,
                padding: 24,
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                borderWidth: 1.5,
                borderColor: 'rgba(184,134,11,0.3)',
                shadowColor: '#B8860B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
                elevation: 8,
                overflow: 'hidden',
              }}
            >
              {/* Card Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: GOLD_500 }}>
                  gold.fi
                </Text>
                <CreditCard size={24} color={GOLD_500} />
              </View>

              {/* Card Number */}
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '600',
                  color: colors.textPrimary,
                  letterSpacing: 3,
                  marginBottom: 24,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {CARD_DATA.cardNumber}
              </Text>

              {/* Card Footer */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <View>
                  <Text style={{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                    Card Holder
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary, textTransform: 'uppercase' }}>
                    {userName}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                    Weight
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: GOLD_500 }}>
                    {formatGrams(CARD_DATA.weightGrams)}
                  </Text>
                </View>
              </View>

              {/* Gold accent line */}
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  backgroundColor: GOLD_500,
                }}
              />
            </View>
          </MotiView>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {[
              { icon: Eye, label: 'Details', onPress: () => setShowDetails(true), delay: 180 },
              { icon: MoreHorizontal, label: 'More', onPress: () => setShowMore(true), delay: 240 },
            ].map(({ icon: Icon, label, onPress, delay }) => (
              <MotiView
                key={label}
                from={{ opacity: 0, translateY: 12 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: 'timing' as const,
                  duration: DURATION.normal,
                  delay,
                }}
                style={{ flex: 1 }}
              >
                <Pressable
                  onPress={onPress}
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    borderRadius: 16,
                    backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                    borderWidth: 1,
                    borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                  }}
                >
                  <View
                    style={{
                      padding: 10,
                      borderRadius: 999,
                      backgroundColor: isDark ? '#242424' : '#F0F0F0',
                    }}
                  >
                    <Icon size={24} color={colors.textMuted} />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>
                    {label}
                  </Text>
                </Pressable>
              </MotiView>
            ))}
          </View>

          {/* Transactions Section */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing' as const,
              duration: DURATION.normal,
              delay: 300,
            }}
          >
            <View style={{ paddingTop: 8 }}>
              <Text className="text-lg font-bold text-text-primary dark:text-text-dark-primary" style={{ marginBottom: 16 }}>
                Transactions
              </Text>

              {/* Empty State */}
              <View
                style={{
                  borderRadius: 16,
                  padding: 32,
                  height: 240,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                  borderStyle: 'dashed',
                }}
              >
                <View
                  style={{
                    padding: 16,
                    borderRadius: 999,
                    backgroundColor: isDark ? '#242424' : '#F0F0F0',
                    marginBottom: 16,
                  }}
                >
                  <Receipt size={32} color={colors.textMuted} />
                </View>
                <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textSecondary }}>
                  No transactions yet
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textMuted,
                    marginTop: 4,
                    textAlign: 'center',
                    maxWidth: 200,
                  }}
                >
                  Your card transactions will appear here once you start using your card.
                </Text>
              </View>
            </View>
          </MotiView>
        </View>
      </ScrollView>

      {/* Card Details Modal */}
      <Modal
        visible={showDetails}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetails(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
          onPress={() => setShowDetails(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              maxHeight: '80%',
            }}
          >
            {/* Handle bar */}
            <View
              style={{
                width: 48,
                height: 5,
                borderRadius: 3,
                backgroundColor: isDark ? '#2D2D2D' : '#E5E7EB',
                alignSelf: 'center',
                marginBottom: 24,
              }}
            />

            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>
                Card Details
              </Text>
              <Pressable
                onPress={() => setShowDetails(false)}
                hitSlop={12}
                style={{
                  padding: 8,
                  borderRadius: 12,
                  backgroundColor: isDark ? '#242424' : '#F0F0F0',
                }}
              >
                <X size={18} color={colors.textMuted} />
              </Pressable>
            </View>

            {/* Detail Items */}
            <View style={{ gap: 16 }}>
              {[
                { icon: Scale, label: 'Weight', value: formatGrams(CARD_DATA.weightGrams) },
                { icon: Gem, label: 'Purity', value: `${CARD_DATA.purity} Fine Gold` },
                { icon: MapPin, label: 'Vault Location', value: CARD_DATA.vaultLocation },
                { icon: Shield, label: 'Serial Number', value: CARD_DATA.serialNumber },
              ].map((item, index) => (
                <MotiView
                  key={item.label}
                  {...FADE_UP}
                  transition={{
                    type: 'timing' as const,
                    duration: DURATION.normal,
                    delay: staggerDelay(index),
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 16,
                      padding: 16,
                      borderRadius: 16,
                      backgroundColor: isDark ? '#242424' : '#F5F5F5',
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                      }}
                    >
                      <item.icon size={20} color={GOLD_500} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 2 }}>
                        {item.label}
                      </Text>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
                        {item.value}
                      </Text>
                    </View>
                  </View>
                </MotiView>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* More Options Modal */}
      <Modal
        visible={showMore}
        animationType="slide"
        transparent
        onRequestClose={() => setShowMore(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
          onPress={() => setShowMore(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
            }}
          >
            {/* Handle bar */}
            <View
              style={{
                width: 48,
                height: 5,
                borderRadius: 3,
                backgroundColor: isDark ? '#2D2D2D' : '#E5E7EB',
                alignSelf: 'center',
                marginBottom: 24,
              }}
            />

            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>
                More Options
              </Text>
              <Pressable
                onPress={() => setShowMore(false)}
                hitSlop={12}
                style={{
                  padding: 8,
                  borderRadius: 12,
                  backgroundColor: isDark ? '#242424' : '#F0F0F0',
                }}
              >
                <X size={18} color={colors.textMuted} />
              </Pressable>
            </View>

            {/* Options */}
            <View style={{ gap: 4 }}>
              {[
                { label: 'Report Lost Card', sublabel: 'Block your card immediately' },
                { label: 'Request Replacement', sublabel: 'Get a new card shipped to you' },
                { label: 'Card Statement', sublabel: 'Download monthly statements' },
              ].map((option, index) => (
                <MotiView
                  key={option.label}
                  {...FADE_UP}
                  transition={{
                    type: 'timing' as const,
                    duration: DURATION.normal,
                    delay: staggerDelay(index),
                  }}
                >
                  <Pressable
                    style={({ pressed }) => ({
                      padding: 16,
                      borderRadius: 12,
                      backgroundColor: pressed
                        ? isDark ? '#242424' : '#F5F5F5'
                        : 'transparent',
                    })}
                  >
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 }}>
                      {option.label}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textMuted }}>
                      {option.sublabel}
                    </Text>
                  </Pressable>
                </MotiView>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
