import { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import { Home, CreditCard, Sprout, Settings } from 'lucide-react-native';
import { useAuth } from '@/lib/auth-provider';

const GOLD_500 = '#B8860B';
const TEXT_MUTED = '#9CA3AF';
const TAB_BAR_LIGHT = '#FFFFFF';
const TAB_BAR_DARK = '#1A1A1A';
const BORDER_DARK = '#2D2D2D';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isReady, isAuthenticated } = useAuth();

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isReady, isAuthenticated]);

  // Show loading while Privy SDK initialises
  if (!isReady || !isAuthenticated) {
    return (
      <View className="flex-1 bg-surface dark:bg-surface-dark items-center justify-center">
        <ActivityIndicator size="large" color={GOLD_500} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: GOLD_500,
        tabBarInactiveTintColor: TEXT_MUTED,
        tabBarStyle: {
          backgroundColor: isDark ? TAB_BAR_DARK : TAB_BAR_LIGHT,
          borderTopColor: isDark ? BORDER_DARK : '#E5E7EB',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontFamily: 'DMSans_Medium',
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="card"
        options={{
          title: 'Card',
          tabBarIcon: ({ color, size }) => (
            <CreditCard size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="yield"
        options={{
          title: 'Earn',
          tabBarIcon: ({ color, size }) => <Sprout size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />

      {/* Hidden from tab bar — accessible via navigation */}
      <Tabs.Screen name="buy" options={{ href: null }} />
      <Tabs.Screen name="sell" options={{ href: null }} />
      <Tabs.Screen name="gift" options={{ href: null }} />
      <Tabs.Screen name="transactions" options={{ href: null }} />
      <Tabs.Screen name="gold-charts" options={{ href: null }} />
      <Tabs.Screen name="autopay" options={{ href: null }} />
      <Tabs.Screen name="redeem" options={{ href: null }} />
    </Tabs>
  );
}
