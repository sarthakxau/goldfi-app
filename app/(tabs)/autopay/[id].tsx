import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

export default function AutoPayDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-surface-dark" edges={['top']}>
      <View className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
          Plan Details
        </Text>
        <Text className="text-text-muted dark:text-text-dark-muted">Plan ID: {id}</Text>
      </View>
    </SafeAreaView>
  );
}
