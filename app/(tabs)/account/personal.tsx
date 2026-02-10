import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import {
  User,
  Mail,
  FileText,
  Shield,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react-native';

import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth-provider';
import { DURATION, FADE_UP, staggerDelay } from '@/lib/animations';

const GOLD_500 = '#B8860B';

interface UserProfile {
  fullName: string;
  email: string;
  pan: string;
  aadhar: string;
}

export default function PersonalInfoScreen() {
  const { isDark, colors } = useTheme();
  const { email: userEmail } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPan, setShowPan] = useState(false);
  const [showAadhar, setShowAadhar] = useState(false);

  const userName = userEmail ? userEmail.split('@')[0] : 'User';

  useEffect(() => {
    // Mock fetch user profile - using real email, mock KYC data
    const timer = setTimeout(() => {
      setProfile({
        fullName: userName,
        email: userEmail || 'user@goldfi.in',
        pan: 'ABCDE1234F',
        aadhar: '1234 5678 9012',
      });
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [userEmail, userName]);

  const maskPan = (pan: string) => {
    if (!pan) return '';
    return '****' + pan.slice(-4);
  };

  const maskAadhar = (aadhar: string) => {
    if (!aadhar) return '';
    const parts = aadhar.split(' ');
    return '**** **** ' + parts[parts.length - 1];
  };

  type DetailItem = {
    icon: typeof User;
    label: string;
    value: string;
    isMasked: boolean;
    show?: boolean;
    toggleShow?: () => void;
  };

  const detailItems: DetailItem[] = profile
    ? [
        { icon: User, label: 'Full Name', value: profile.fullName, isMasked: false },
        { icon: Mail, label: 'Email', value: profile.email, isMasked: false },
        {
          icon: FileText,
          label: 'PAN',
          value: profile.pan,
          isMasked: true,
          show: showPan,
          toggleShow: () => setShowPan((v) => !v),
        },
        {
          icon: Shield,
          label: 'Aadhaar',
          value: profile.aadhar,
          isMasked: true,
          show: showAadhar,
          toggleShow: () => setShowAadhar((v) => !v),
        },
      ]
    : [];

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-surface-dark" edges={['top']}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#2D2D2D' : '#E5E7EB',
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={{
            padding: 8,
            marginLeft: -8,
            borderRadius: 12,
          }}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>
          Personal Details
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          /* Loading Skeleton */
          <View style={{ gap: 16 }}>
            {[1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={{
                  borderRadius: 16,
                  padding: 16,
                  backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: isDark ? '#242424' : '#F0F0F0',
                    }}
                  />
                  <View style={{ flex: 1, gap: 8 }}>
                    <View
                      style={{
                        height: 12,
                        width: 64,
                        borderRadius: 4,
                        backgroundColor: isDark ? '#242424' : '#F0F0F0',
                      }}
                    />
                    <View
                      style={{
                        height: 18,
                        width: 128,
                        borderRadius: 4,
                        backgroundColor: isDark ? '#242424' : '#F0F0F0',
                      }}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <>
            {/* Detail Items */}
            <View style={{ gap: 12 }}>
              {detailItems.map((item, index) => {
                const Icon = item.icon;
                const displayValue = item.isMasked
                  ? item.show
                    ? item.value
                    : item.label === 'PAN'
                      ? maskPan(item.value)
                      : maskAadhar(item.value)
                  : item.value;

                return (
                  <MotiView
                    key={item.label}
                    from={{ opacity: 0, translateY: 12 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{
                      type: 'timing' as const,
                      duration: DURATION.normal,
                      delay: staggerDelay(index, 60, 100),
                    }}
                  >
                    <View
                      style={{
                        borderRadius: 16,
                        padding: 16,
                        backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                        borderWidth: 1,
                        borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 16,
                      }}
                    >
                      <View
                        style={{
                          padding: 10,
                          borderRadius: 12,
                          backgroundColor: isDark ? '#242424' : '#F0F0F0',
                        }}
                      >
                        <Icon size={20} color={GOLD_500} />
                      </View>

                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 2 }}>
                          {item.label}
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: colors.textPrimary,
                          }}
                          numberOfLines={1}
                        >
                          {displayValue}
                        </Text>
                      </View>

                      {item.isMasked && (
                        <Pressable
                          onPress={item.toggleShow}
                          hitSlop={12}
                          style={{ padding: 8, marginRight: -8 }}
                        >
                          {item.show ? (
                            <EyeOff size={20} color={colors.textMuted} />
                          ) : (
                            <Eye size={20} color={colors.textMuted} />
                          )}
                        </Pressable>
                      )}
                    </View>
                  </MotiView>
                );
              })}
            </View>

            {/* Edit Profile Button */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: 'timing' as const,
                duration: DURATION.normal,
                delay: 400,
              }}
            >
              <Pressable
                style={({ pressed }) => ({
                  marginTop: 24,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 16,
                  backgroundColor: GOLD_500,
                  alignItems: 'center',
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                  Edit Profile
                </Text>
              </Pressable>
            </MotiView>

            {/* KYC Notice */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: 'timing' as const,
                duration: DURATION.normal,
                delay: 480,
              }}
            >
              <View
                style={{
                  marginTop: 16,
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(184,134,11,0.2)',
                  backgroundColor: 'rgba(184,134,11,0.05)',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <AlertTriangle size={20} color={GOLD_500} style={{ marginTop: 2 }} />
                <Text style={{ flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
                  KYC details cannot be modified. Contact support for changes.
                </Text>
              </View>
            </MotiView>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
