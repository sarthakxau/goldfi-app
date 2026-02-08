'use client';

import { useUpiFlow } from '@/hooks/useUpiFlow';
import { UpiAmountScreen } from './UpiAmountScreen';
import { UpiPaymentScreen } from './UpiPaymentScreen';
import { UpiProcessingScreen } from './UpiProcessingScreen';
import { UpiSuccessScreen } from './UpiSuccessScreen';
import { motion } from 'motion/react';
import { FadeUp } from '@/components/animations';
import { SPRING, EASE_OUT_EXPO, DURATION } from '@/lib/animations';

interface UpiFlowProps {
  onExit: () => void;
}

export function UpiFlow({ onExit }: UpiFlowProps) {
  const flow = useUpiFlow();

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
          totalPayable={flow.confirmData?.totalPayable ?? flow.quote?.totalPayable ?? 0}
          ratePerGram={flow.confirmData?.ratePerGram ?? flow.quote?.ratePerGram ?? 0}
          tds={flow.confirmData?.tds ?? flow.quote?.tds ?? 0}
          inrAmount={flow.confirmData?.inrAmount ?? flow.quote?.inrAmount ?? 0}
          onBuyMore={flow.reset}
        />
      );

    case 'error':
      return (
        <div className="min-h-screen bg-surface dark:bg-[#0F0F0F] p-6 max-w-lg mx-auto flex flex-col items-center justify-center">
          <FadeUp delay={0}>
            <motion.div
              className="mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...SPRING.bouncy, delay: 0.1 }}
            >
              <div className="w-20 h-20 rounded-full bg-error/20 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-error flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">!</span>
                </div>
              </div>
            </motion.div>
          </FadeUp>
          <FadeUp delay={0.15}>
            <h2 className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] mb-2">
              Payment Failed
            </h2>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="text-text-muted dark:text-[#6B7280] text-center mb-10">
              {flow.error || 'Something went wrong with your payment'}
            </p>
          </FadeUp>
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.normal, ease: EASE_OUT_EXPO, delay: 0.3 }}
          >
            <motion.button
              onClick={flow.reset}
              className="w-full bg-gold-gradient text-white font-bold text-lg py-4 rounded-2xl transition-all mb-4"
              whileTap={{ scale: 0.97 }}
              transition={SPRING.snappy}
            >
              Try Again
            </motion.button>
            <motion.button
              onClick={onExit}
              className="w-full text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] font-medium transition-colors"
              whileTap={{ scale: 0.97 }}
              transition={SPRING.snappy}
            >
              Go Back
            </motion.button>
          </motion.div>
        </div>
      );

    default:
      return null;
  }
}
