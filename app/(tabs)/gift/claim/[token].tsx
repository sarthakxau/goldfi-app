import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

export default function GiftClaimScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-surface-dark" edges={['top']}>
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-16 h-16 rounded-full bg-gold-100 dark:bg-gold-500/10 items-center justify-center mb-4">
          <Text className="text-2xl">🎁</Text>
        </View>
        <Text className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-2 text-center">
          You received gold!
        </Text>
        <Text className="text-sm text-text-muted dark:text-text-dark-muted text-center">
          Claim token: {token}
        </Text>
      </View>
    </SafeAreaView>
  );
}
