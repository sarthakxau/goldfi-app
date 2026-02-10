import { View, Text, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { useUpiFlow } from '@/hooks/useUpiFlow';
import { UpiAmountScreen } from './UpiAmountScreen';
import { UpiPaymentScreen } from './UpiPaymentScreen';
import { UpiProcessingScreen } from './UpiProcessingScreen';
import { UpiSuccessScreen } from './UpiSuccessScreen';
import { useTheme } from '@/lib/theme';
import { SCALE_IN, SPRING, FADE_UP } from '@/lib/animations';

interface UpiFlowProps {
  onExit: () => void;
}

export function UpiFlow({ onExit }: UpiFlowProps) {
  const flow = useUpiFlow();
  const { colors, isDark } = useTheme();

  switch (flow.step) {
    case 'amount':
      return (
        <UpiAmountScreen
          inrAmount={flow.inrAmount}
          quote={flow.quote}
          goldPricePerGram={flow.goldPricePerGram}
          priceLoading={flow.priceLoading}
          isAmountValid={flow.isAmountValid}
          canProceedToPayment={flow.canProceedToPayment}
          minAmount={flow.minAmount}
          maxAmount={flow.maxAmount}
          onAmountChange={flow.setAmount}
          onContinue={flow.goToPayment}
          onBack={onExit}
          onFetchPrice={flow.fetchPrice}
        />
      );

    case 'payment':
      return (
        <UpiPaymentScreen
          totalPayable={flow.quote?.totalPayable ?? 0}
          selectedApp={flow.selectedApp}
          upiId={flow.upiId}
          canPay={flow.canPay}
          confirmLoading={flow.confirmLoading}
          onSelectApp={flow.selectApp}
          onUpiIdChange={flow.setUpiId}
          onPay={flow.initiatePayment}
          onBack={flow.goToAmount}
        />
      );

    case 'processing':
      return (
        <UpiProcessingScreen
          totalPayable={flow.quote?.totalPayable ?? 0}
          goldGrams={flow.quote?.goldGrams ?? 0}
          countdownSeconds={flow.countdownSeconds}
        />
      );

    case 'success':
      return (
        <UpiSuccessScreen
          goldGrams={flow.confirmData?.goldGrams ?? flow.quote?.goldGrams ?? 0}
          totalPayable={
            flow.confirmData?.totalPayable ?? flow.quote?.totalPayable ?? 0
          }
          ratePerGram={
            flow.confirmData?.ratePerGram ?? flow.quote?.ratePerGram ?? 0
          }
          tds={flow.confirmData?.tds ?? flow.quote?.tds ?? 0}
          inrAmount={
            flow.confirmData?.inrAmount ?? flow.quote?.inrAmount ?? 0
          }
          onBuyMore={flow.reset}
        />
      );

    case 'error':
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? '#0F0F0F' : '#F5F5F5',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', ...SPRING.bouncy }}
            style={{ marginBottom: 24 }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(239,68,68,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: '#EF4444',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontWeight: '700',
                    fontSize: 24,
                  }}
                >
                  !
                </Text>
              </View>
            </View>
          </MotiView>

          <MotiView {...FADE_UP}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              Payment Failed
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textMuted,
                textAlign: 'center',
                marginBottom: 40,
              }}
            >
              {flow.error || 'Something went wrong with your payment'}
            </Text>
          </MotiView>

          <View style={{ width: '100%' }}>
            <Pressable
              onPress={flow.reset}
              style={{
                backgroundColor: '#B8860B',
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 17 }}>
                Try Again
              </Text>
            </Pressable>
            <Pressable
              onPress={onExit}
              style={{ alignItems: 'center', paddingVertical: 12 }}
            >
              <Text
                style={{
                  color: colors.textMuted,
                  fontWeight: '500',
                  fontSize: 15,
                }}
              >
                Go Back
              </Text>
            </Pressable>
          </View>
        </View>
      );

    default:
      return null;
  }
}
