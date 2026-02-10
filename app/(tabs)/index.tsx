import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: fetch prices, holdings, transactions
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-surface-dark" edges={['top']}>
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#B8860B" />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between py-4">
          <View>
            <Text className="text-sm text-text-secondary dark:text-text-dark-secondary">
              Good morning
            </Text>
            <Text className="text-xl font-bold text-text-primary dark:text-text-dark-primary">
              gold.fi
            </Text>
          </View>
        </View>

        {/* Holdings Card Placeholder */}
        <View className="bg-surface-card dark:bg-surface-dark-card rounded-2xl p-5 mb-4 border border-border-subtle dark:border-border-dark-subtle">
          <Text className="text-sm text-text-secondary dark:text-text-dark-secondary mb-1">
            Your Gold
          </Text>
          <Text className="text-3xl font-bold text-text-primary dark:text-text-dark-primary">
            0.000 g
          </Text>
          <Text className="text-sm text-text-muted dark:text-text-dark-muted mt-1">
            ₹0.00
          </Text>
        </View>

        {/* Price Display Placeholder */}
        <View className="bg-surface-card dark:bg-surface-dark-card rounded-2xl p-5 mb-4 border border-border-subtle dark:border-border-dark-subtle">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="w-2 h-2 rounded-full bg-success" />
            <Text className="text-xs text-text-muted dark:text-text-dark-muted">LIVE</Text>
          </View>
          <Text className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
            Gold Price
          </Text>
          <Text className="text-2xl font-bold text-gold-500 mt-1">₹--,---/g</Text>
        </View>

        {/* Quick Actions */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-gold-500 rounded-2xl p-4 items-center">
            <Text className="text-white font-semibold">Buy Gold</Text>
          </View>
          <View className="flex-1 bg-surface-card dark:bg-surface-dark-card rounded-2xl p-4 items-center border border-border-subtle dark:border-border-dark-subtle">
            <Text className="text-text-primary dark:text-text-dark-primary font-semibold">
              Sell Gold
            </Text>
          </View>
        </View>

        {/* Recent Transactions Placeholder */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-3">
            Recent Activity
          </Text>
          <View className="bg-surface-card dark:bg-surface-dark-card rounded-2xl p-8 items-center border border-border-subtle dark:border-border-dark-subtle">
            <Text className="text-text-muted dark:text-text-dark-muted">
              No transactions yet
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
