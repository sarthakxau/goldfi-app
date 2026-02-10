import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { MotiView } from 'moti';
import * as Clipboard from 'expo-clipboard';
import {
  User,
  Shield,
  Key,
  Palette,
  FileText,
  HelpCircle,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Copy,
  Check,
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth-provider';
import { truncateAddress } from '@/lib/utils';
import {
  FADE_UP,
  SCALE_IN,
  SPRING,
  DURATION,
  staggerDelay,
} from '@/lib/animations';

// ── Settings Row ──────────────────────────────────────────────
interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  detail?: string;
  href?: string;
  onPress?: () => void;
}

function SettingsItem({ icon, label, detail, href, onPress }: SettingsItemProps) {
  const { colors, isDark } = useTheme();

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: isDark ? '#242424' : '#F0F0F0',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        {icon}
      </View>
      <Text
        style={{
          flex: 1,
          fontSize: 15,
          color: colors.textPrimary,
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
      {detail && (
        <Text
          style={{
            fontSize: 13,
            color: colors.textMuted,
            marginRight: 8,
          }}
        >
          {detail}
        </Text>
      )}
      <ChevronRight size={16} color={colors.textMuted} />
    </View>
  );

  if (href) {
    return (
      <Link href={href as any} asChild>
        <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
          {content}
        </Pressable>
      </Link>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      {content}
    </Pressable>
  );
}

// ── Section Header ────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 8,
        marginTop: 24,
        marginLeft: 4,
      }}
    >
      {title}
    </Text>
  );
}

// ── Section Card ──────────────────────────────────────────────
function SectionCard({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <View
      style={{
        borderRadius: 16,
        backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
        borderWidth: 1,
        borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
}

function Divider() {
  const { isDark } = useTheme();
  return (
    <View
      style={{
        height: 1,
        backgroundColor: isDark ? '#2D2D2D' : '#E5E7EB',
        marginLeft: 64,
      }}
    />
  );
}

// ── Theme Modal ───────────────────────────────────────────────
const THEME_OPTIONS = [
  { key: 'light' as const, label: 'Light', Icon: Sun },
  { key: 'dark' as const, label: 'Dark', Icon: Moon },
  { key: 'system' as const, label: 'System', Icon: Monitor },
];

function ThemeModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { theme, setTheme, colors, isDark } = useTheme();
  const GOLD = '#D4A012';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={() => {}}
          style={{
            width: '80%',
            maxWidth: 320,
            borderRadius: 20,
            backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
            padding: 24,
          }}
        >
          <MotiView {...SCALE_IN}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              Appearance
            </Text>
            {THEME_OPTIONS.map((opt) => {
              const selected = theme === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => {
                    setTheme(opt.key);
                    onClose();
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: selected
                      ? isDark
                        ? 'rgba(212,160,18,0.12)'
                        : 'rgba(184,134,11,0.08)'
                      : 'transparent',
                    marginBottom: 4,
                  }}
                >
                  <opt.Icon
                    size={20}
                    color={selected ? GOLD : colors.textMuted}
                  />
                  <Text
                    style={{
                      flex: 1,
                      marginLeft: 12,
                      fontSize: 15,
                      fontWeight: selected ? '600' : '400',
                      color: selected ? GOLD : colors.textPrimary,
                    }}
                  >
                    {opt.label}
                  </Text>
                  {selected && <Check size={18} color={GOLD} />}
                </Pressable>
              );
            })}
          </MotiView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Security Modal ────────────────────────────────────────────
function SecurityModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { walletAddress } = useAuth();
  const { colors, isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const GOLD = '#D4A012';

  const handleCopy = useCallback(async () => {
    if (!walletAddress) return;
    await Clipboard.setStringAsync(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [walletAddress]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={() => {}}
          style={{
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
            padding: 24,
            paddingBottom: 40,
          }}
        >
          <MotiView {...FADE_UP}>
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: isDark ? '#3D3D3D' : '#D1D5DB',
                alignSelf: 'center',
                marginBottom: 20,
              }}
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: 20,
              }}
            >
              Security
            </Text>

            {/* Wallet Address */}
            <Text
              style={{
                fontSize: 12,
                color: colors.textMuted,
                marginBottom: 8,
              }}
            >
              Wallet Address (Arbitrum)
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isDark ? '#242424' : '#F0F0F0',
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontFamily: 'monospace',
                  color: colors.textPrimary,
                }}
                numberOfLines={1}
              >
                {walletAddress
                  ? truncateAddress(walletAddress)
                  : 'No wallet connected'}
              </Text>
              {walletAddress && (
                <Pressable onPress={handleCopy} hitSlop={8}>
                  {copied ? (
                    <Check size={18} color="#10B981" />
                  ) : (
                    <Copy size={18} color={GOLD} />
                  )}
                </Pressable>
              )}
            </View>

            <Pressable
              onPress={onClose}
              style={{
                paddingVertical: 14,
                borderRadius: 14,
                backgroundColor: isDark ? '#242424' : '#F0F0F0',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontWeight: '600',
                  color: colors.textPrimary,
                  fontSize: 15,
                }}
              >
                Close
              </Text>
            </Pressable>
          </MotiView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Logout Confirm Modal ──────────────────────────────────────
function LogoutConfirmModal({
  visible,
  loading,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { colors, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={onCancel}
      >
        <Pressable
          onPress={() => {}}
          style={{
            width: '80%',
            maxWidth: 320,
            borderRadius: 20,
            backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
            padding: 24,
          }}
        >
          <MotiView {...SCALE_IN}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.textPrimary,
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              Sign Out
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: 'center',
                marginBottom: 24,
              }}
            >
              Are you sure you want to sign out?
            </Text>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={{
                paddingVertical: 14,
                borderRadius: 14,
                backgroundColor: '#EF4444',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
                  Sign Out
                </Text>
              )}
            </Pressable>
            <Pressable
              onPress={onCancel}
              style={{
                paddingVertical: 14,
                borderRadius: 14,
                backgroundColor: isDark ? '#242424' : '#F0F0F0',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontWeight: '600',
                  color: colors.textPrimary,
                  fontSize: 15,
                }}
              >
                Cancel
              </Text>
            </Pressable>
          </MotiView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────
export default function AccountScreen() {
  const { theme, colors, isDark } = useTheme();
  const { logout, email, walletAddress } = useAuth();

  const [loggingOut, setLoggingOut] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const GOLD = '#D4A012';

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  // Derive initials from email
  const initials = email
    ? email.split('@')[0].slice(0, 2).toUpperCase()
    : 'U';

  const themeName =
    theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light';

  return (
    <SafeAreaView
      className="flex-1 bg-surface dark:bg-surface-dark"
      edges={['top']}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile Header ─────────────────────────── */}
        <MotiView
          {...FADE_UP}
          style={{
            alignItems: 'center',
            paddingTop: 24,
            paddingBottom: 28,
            paddingHorizontal: 24,
          }}
        >
          {/* Avatar */}
          <MotiView
            from={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', ...SPRING.gentle }}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: isDark
                ? 'rgba(212,160,18,0.15)'
                : 'rgba(184,134,11,0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                fontSize: 26,
                fontWeight: '700',
                color: GOLD,
              }}
            >
              {initials}
            </Text>
          </MotiView>

          {/* Name / Email */}
          {email && (
            <>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: colors.textPrimary,
                  marginBottom: 4,
                }}
              >
                {email.split('@')[0]}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textMuted,
                  marginBottom: 8,
                }}
              >
                {email}
              </Text>
            </>
          )}

          {/* KYC Badge */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDark
                ? 'rgba(16,185,129,0.12)'
                : 'rgba(16,185,129,0.08)',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              gap: 6,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#10B981',
              }}
            />
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: '#10B981',
              }}
            >
              Verified
            </Text>
          </View>
        </MotiView>

        <View style={{ paddingHorizontal: 20 }}>
          {/* ── Account Section ─────────────────────────── */}
          <MotiView
            {...FADE_UP}
            transition={{
              type: 'timing' as const,
              duration: DURATION.normal,
              delay: staggerDelay(0),
            }}
          >
            <SectionHeader title="Account" />
            <SectionCard>
              <SettingsItem
                icon={<User size={18} color={colors.textMuted} />}
                label="Personal Info"
                href="/(tabs)/account/personal"
              />
              <Divider />
              <SettingsItem
                icon={<Shield size={18} color={colors.textMuted} />}
                label="KYC Status"
                detail="Verified"
                href="/(tabs)/account/kyc"
              />
              <Divider />
              <SettingsItem
                icon={<Key size={18} color={colors.textMuted} />}
                label="Security"
                onPress={() => setShowSecurityModal(true)}
              />
            </SectionCard>
          </MotiView>

          {/* ── Preferences Section ──────────────────────── */}
          <MotiView
            {...FADE_UP}
            transition={{
              type: 'timing' as const,
              duration: DURATION.normal,
              delay: staggerDelay(1),
            }}
          >
            <SectionHeader title="Preferences" />
            <SectionCard>
              <SettingsItem
                icon={<Palette size={18} color={colors.textMuted} />}
                label="Appearance"
                detail={themeName}
                onPress={() => setShowThemeModal(true)}
              />
            </SectionCard>
          </MotiView>

          {/* ── Legal Section ─────────────────────────────── */}
          <MotiView
            {...FADE_UP}
            transition={{
              type: 'timing' as const,
              duration: DURATION.normal,
              delay: staggerDelay(2),
            }}
          >
            <SectionHeader title="Legal" />
            <SectionCard>
              <SettingsItem
                icon={<FileText size={18} color={colors.textMuted} />}
                label="Terms & Conditions"
                onPress={() => {}}
              />
              <Divider />
              <SettingsItem
                icon={<FileText size={18} color={colors.textMuted} />}
                label="Privacy Policy"
                onPress={() => {}}
              />
              <Divider />
              <SettingsItem
                icon={<HelpCircle size={18} color={colors.textMuted} />}
                label="Help & Support"
                onPress={() => {}}
              />
            </SectionCard>
          </MotiView>

          {/* ── Sign Out ──────────────────────────────────── */}
          <MotiView
            {...FADE_UP}
            transition={{
              type: 'timing' as const,
              duration: DURATION.normal,
              delay: staggerDelay(3),
            }}
          >
            <Pressable
              onPress={() => setShowLogoutModal(true)}
              style={({ pressed }) => ({
                marginTop: 28,
                paddingVertical: 14,
                borderRadius: 16,
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                borderWidth: 1,
                borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <LogOut size={18} color="#EF4444" />
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#EF4444' }}>
                Sign Out
              </Text>
            </Pressable>
          </MotiView>
        </View>
      </ScrollView>

      {/* ── Modals ───────────────────────────────────── */}
      <ThemeModal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />
      <SecurityModal
        visible={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />
      <LogoutConfirmModal
        visible={showLogoutModal}
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </SafeAreaView>
  );
}
