import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import {
  Shield,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  FileText,
  AlertCircle,
} from 'lucide-react-native';

import { useTheme } from '@/lib/theme';
import { DURATION, staggerDelay } from '@/lib/animations';

const GOLD_500 = '#B8860B';

type KycStatusType = 'verified' | 'pending' | 'rejected';

interface KycData {
  status: KycStatusType;
  statusMessage: string;
  submissionDate: string;
  lastUpdated: string;
  documents: Array<{
    name: string;
    status: KycStatusType;
  }>;
}

interface StatusConfig {
  icon: typeof CheckCircle2;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
}

function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case 'verified':
      return {
        icon: CheckCircle2,
        color: '#10B981',
        bgColor: 'rgba(16,185,129,0.1)',
        borderColor: 'rgba(16,185,129,0.2)',
        label: 'Verified',
      };
    case 'pending':
      return {
        icon: Clock,
        color: '#F59E0B',
        bgColor: 'rgba(245,158,11,0.1)',
        borderColor: 'rgba(245,158,11,0.2)',
        label: 'Pending',
      };
    case 'rejected':
      return {
        icon: XCircle,
        color: '#EF4444',
        bgColor: 'rgba(239,68,68,0.1)',
        borderColor: 'rgba(239,68,68,0.2)',
        label: 'Rejected',
      };
    default:
      return {
        icon: AlertCircle,
        color: '#9CA3AF',
        bgColor: 'rgba(156,163,175,0.1)',
        borderColor: 'rgba(156,163,175,0.2)',
        label: 'Unknown',
      };
  }
}

export default function KycScreen() {
  const { isDark, colors } = useTheme();
  const [kycData, setKycData] = useState<KycData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch KYC status
    const timer = setTimeout(() => {
      setKycData({
        status: 'verified',
        statusMessage: 'Your KYC has been verified successfully.',
        submissionDate: '2024-01-15',
        lastUpdated: '2024-01-16',
        documents: [
          { name: 'PAN Card', status: 'verified' },
          { name: 'Aadhaar Card', status: 'verified' },
          { name: 'Address Proof', status: 'verified' },
        ],
      });
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const kycConfig = kycData ? getStatusConfig(kycData.status) : null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

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
          KYC Status
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          /* Loading Skeleton */
          <View
            style={{
              borderRadius: 16,
              padding: 24,
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderWidth: 1,
              borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: isDark ? '#242424' : '#F0F0F0',
                  marginBottom: 16,
                }}
              />
              <View
                style={{
                  height: 24,
                  width: 96,
                  borderRadius: 4,
                  backgroundColor: isDark ? '#242424' : '#F0F0F0',
                  marginBottom: 8,
                }}
              />
              <View
                style={{
                  height: 16,
                  width: 192,
                  borderRadius: 4,
                  backgroundColor: isDark ? '#242424' : '#F0F0F0',
                }}
              />
            </View>
          </View>
        ) : kycData && kycConfig ? (
          <>
            {/* Status Card */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: 'timing' as const,
                duration: DURATION.normal,
              }}
            >
              <View
                style={{
                  borderRadius: 16,
                  padding: 24,
                  marginBottom: 16,
                  backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: kycConfig.borderColor,
                  alignItems: 'center',
                }}
              >
                <MotiView
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: 'timing' as const,
                    duration: DURATION.slow,
                    delay: 100,
                  }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: kycConfig.bgColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <kycConfig.icon size={40} color={kycConfig.color} />
                  </View>
                </MotiView>

                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '700',
                    color: kycConfig.color,
                    marginBottom: 8,
                  }}
                >
                  {kycConfig.label}
                </Text>

                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    textAlign: 'center',
                  }}
                >
                  {kycData.statusMessage}
                </Text>
              </View>
            </MotiView>

            {/* Details Card */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: 'timing' as const,
                duration: DURATION.normal,
                delay: 120,
              }}
            >
              <View
                style={{
                  borderRadius: 16,
                  marginBottom: 16,
                  backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                  overflow: 'hidden',
                }}
              >
                {/* Submission Date */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? '#2D2D2D' : '#E5E7EB',
                  }}
                >
                  <Text style={{ fontSize: 14, color: colors.textMuted }}>
                    Submission Date
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
                    {formatDate(kycData.submissionDate)}
                  </Text>
                </View>

                {/* Last Updated */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 16,
                  }}
                >
                  <Text style={{ fontSize: 14, color: colors.textMuted }}>
                    Last Updated
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
                    {formatDate(kycData.lastUpdated)}
                  </Text>
                </View>
              </View>
            </MotiView>

            {/* Documents Header */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: 'timing' as const,
                duration: DURATION.normal,
                delay: 200,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: colors.textMuted,
                  marginBottom: 12,
                  paddingHorizontal: 8,
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                }}
              >
                Documents
              </Text>
            </MotiView>

            {/* Document List */}
            <View style={{ gap: 12 }}>
              {kycData.documents.map((doc, index) => {
                const docConfig = getStatusConfig(doc.status);
                const DocIcon = docConfig.icon;

                return (
                  <MotiView
                    key={doc.name}
                    from={{ opacity: 0, translateY: 12 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{
                      type: 'timing' as const,
                      duration: DURATION.normal,
                      delay: staggerDelay(index, 60, 260),
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
                        justifyContent: 'space-between',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View
                          style={{
                            padding: 8,
                            borderRadius: 12,
                            backgroundColor: docConfig.bgColor,
                          }}
                        >
                          <FileText size={20} color={docConfig.color} />
                        </View>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
                          {doc.name}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 8,
                          backgroundColor: docConfig.bgColor,
                        }}
                      >
                        <DocIcon size={14} color={docConfig.color} />
                        <Text style={{ fontSize: 12, fontWeight: '600', color: docConfig.color }}>
                          {docConfig.label}
                        </Text>
                      </View>
                    </View>
                  </MotiView>
                );
              })}
            </View>

            {/* Info Note */}
            {kycData.status === 'verified' && (
              <MotiView
                from={{ opacity: 0, translateY: 12 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: 'timing' as const,
                  duration: DURATION.normal,
                  delay: 450,
                }}
              >
                <View
                  style={{
                    marginTop: 24,
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(16,185,129,0.2)',
                    backgroundColor: 'rgba(16,185,129,0.05)',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  <Shield size={20} color="#10B981" style={{ marginTop: 2 }} />
                  <Text style={{ flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
                    Your account is fully verified. You can now buy and sell gold without any restrictions.
                  </Text>
                </View>
              </MotiView>
            )}

            {kycData.status === 'pending' && (
              <MotiView
                from={{ opacity: 0, translateY: 12 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: 'timing' as const,
                  duration: DURATION.normal,
                  delay: 450,
                }}
              >
                <View
                  style={{
                    marginTop: 24,
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(245,158,11,0.2)',
                    backgroundColor: 'rgba(245,158,11,0.05)',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  <Clock size={20} color="#F59E0B" style={{ marginTop: 2 }} />
                  <Text style={{ flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
                    Your KYC is under review. This usually takes 24-48 hours. We will notify you once it is complete.
                  </Text>
                </View>
              </MotiView>
            )}

            {kycData.status === 'rejected' && (
              <MotiView
                from={{ opacity: 0, translateY: 12 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: 'timing' as const,
                  duration: DURATION.normal,
                  delay: 450,
                }}
              >
                <View
                  style={{
                    marginTop: 24,
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(239,68,68,0.2)',
                    backgroundColor: 'rgba(239,68,68,0.05)',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  <AlertCircle size={20} color="#EF4444" style={{ marginTop: 2 }} />
                  <Text style={{ flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
                    Your KYC was rejected. Please contact support for more information.
                  </Text>
                </View>
              </MotiView>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
