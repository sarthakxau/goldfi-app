import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BuyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-surface-dark" edges={['top']}>
      <View className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
          Buy Gold
        </Text>
        {/* TODO: Migrate SwapModal, UPI flow */}
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-muted dark:text-text-dark-muted">
            Buy flow coming soon
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
