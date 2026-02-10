import { router } from 'expo-router';
import { UpiFlow } from '@/components/Buy/UpiFlow';

export default function UpiPaymentScreen() {
  return <UpiFlow onExit={() => router.back()} />;
}
