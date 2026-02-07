'use client';

import { useUpiFlow } from '@/hooks/useUpiFlow';
import { UpiAmountScreen } from './UpiAmountScreen';
import { UpiPaymentScreen } from './UpiPaymentScreen';
import { UpiProcessingScreen } from './UpiProcessingScreen';
import { UpiSuccessScreen } from './UpiSuccessScreen';

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
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full bg-error/20 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-error flex items-center justify-center">
                <span className="text-white font-bold text-2xl">!</span>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-text-primary dark:text-[#F0F0F0] mb-2">
            Payment Failed
          </h2>
          <p className="text-text-muted dark:text-[#6B7280] text-center mb-10">
            {flow.error || 'Something went wrong with your payment'}
          </p>
          <button
            onClick={flow.reset}
            className="w-full bg-gold-gradient text-white font-bold text-lg py-4 rounded-2xl active:scale-[0.98] transition-all mb-4"
          >
            Try Again
          </button>
          <button
            onClick={onExit}
            className="text-text-muted dark:text-[#6B7280] hover:text-text-primary dark:hover:text-[#F0F0F0] font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      );

    default:
      return null;
  }
}
