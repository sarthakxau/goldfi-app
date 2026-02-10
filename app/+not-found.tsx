import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 bg-surface dark:bg-surface-dark items-center justify-center px-6">
      <Text className="text-6xl mb-4">🔍</Text>
      <Text className="text-xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
        Page Not Found
      </Text>
      <Text className="text-text-muted dark:text-text-dark-muted mb-6 text-center">
        The page you&apos;re looking for doesn&apos;t exist.
      </Text>
      <Link href="/" asChild>
        <Pressable className="bg-gold-500 rounded-full px-6 py-3 active:opacity-80">
          <Text className="text-white font-semibold">Go Home</Text>
        </Pressable>
      </Link>
    </View>
  );
}
