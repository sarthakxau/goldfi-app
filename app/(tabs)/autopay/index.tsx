import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AutoPayScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-surface-dark" edges={['top']}>
      <View className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
          Auto Pay
        </Text>
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-muted dark:text-text-dark-muted">
            Auto pay coming soon
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
