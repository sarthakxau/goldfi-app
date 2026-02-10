import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { ChevronRight, User, Shield, Moon, LogOut } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth-provider';

export default function AccountScreen() {
  const { toggleTheme, resolvedTheme } = useTheme();
  const { logout, email, walletAddress } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      // Auth guard in tabs layout handles redirect
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-surface-dark" edges={['top']}>
      <View className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
          Settings
        </Text>

        {/* User info */}
        {email && (
          <Text className="text-sm text-text-muted dark:text-text-dark-muted mb-6">
            {email}
          </Text>
        )}

        <View className="bg-surface-card dark:bg-surface-dark-card rounded-2xl border border-border-subtle dark:border-border-dark-subtle overflow-hidden">
          <Link href="/(tabs)/account/personal" asChild>
            <Pressable className="flex-row items-center justify-between p-4 border-b border-border-subtle dark:border-border-dark-subtle active:opacity-70">
              <View className="flex-row items-center gap-3">
                <User size={20} color="#6B7280" />
                <Text className="text-base text-text-primary dark:text-text-dark-primary">
                  Personal Info
                </Text>
              </View>
              <ChevronRight size={18} color="#9CA3AF" />
            </Pressable>
          </Link>

          <Link href="/(tabs)/account/kyc" asChild>
            <Pressable className="flex-row items-center justify-between p-4 border-b border-border-subtle dark:border-border-dark-subtle active:opacity-70">
              <View className="flex-row items-center gap-3">
                <Shield size={20} color="#6B7280" />
                <Text className="text-base text-text-primary dark:text-text-dark-primary">
                  KYC Verification
                </Text>
              </View>
              <ChevronRight size={18} color="#9CA3AF" />
            </Pressable>
          </Link>

          <Pressable
            className="flex-row items-center justify-between p-4 active:opacity-70"
            onPress={toggleTheme}
          >
            <View className="flex-row items-center gap-3">
              <Moon size={20} color="#6B7280" />
              <Text className="text-base text-text-primary dark:text-text-dark-primary">
                Dark Mode
              </Text>
            </View>
            <Text className="text-sm text-text-muted dark:text-text-dark-muted">
              {resolvedTheme === 'dark' ? 'On' : 'Off'}
            </Text>
          </Pressable>
        </View>

        {/* Logout */}
        <View className="mt-6">
          <Pressable
            className="bg-surface-card dark:bg-surface-dark-card rounded-2xl border border-border-subtle dark:border-border-dark-subtle p-4 flex-row items-center justify-center gap-2 active:opacity-70"
            onPress={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <LogOut size={18} color="#EF4444" />
                <Text className="text-base font-medium text-error">
                  Log Out
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
