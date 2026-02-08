'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { TolaPriceDisplay } from '@/components/TolaPrice';
import { CheckCircle, Sparkles } from 'lucide-react';
import { TERMS_AND_CONDITIONS } from '@/lib/copy';
import { motion, AnimatePresence } from 'motion/react';
import { SPRING, EASE_OUT_EXPO, DURATION, backdropFade, modalScale } from '@/lib/animations';

// --- SVG Illustrations ---

function ChartIllustration() {
  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] rounded-2xl p-5 w-full">
      <p className="text-xs text-text-muted dark:text-[#6B7280] mb-1">1 year gold price performance</p>
      <p className="text-2xl font-bold text-success mb-0.5">gold yield</p>
      <p className="text-sm text-gold-500">variable rates, risks apply</p>
      <svg viewBox="0 0 300 120" className="w-full mt-4" fill="none">
        {/* Grid lines */}
        <line x1="0" y1="30" x2="300" y2="30" stroke="rgba(209,213,219,0.4)" strokeWidth="0.5" />
        <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(209,213,219,0.4)" strokeWidth="0.5" />
        <line x1="0" y1="90" x2="300" y2="90" stroke="rgba(209,213,219,0.4)" strokeWidth="0.5" />
        {/* Area fill */}
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B8860B" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#B8860B" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,95 C30,90 50,85 80,78 C110,71 130,60 160,45 C190,30 210,35 230,25 C250,15 270,18 300,10 L300,120 L0,120 Z"
          fill="url(#chartFill)"
        />
        {/* Line */}
        <path
          d="M0,95 C30,90 50,85 80,78 C110,71 130,60 160,45 C190,30 210,35 230,25 C250,15 270,18 300,10"
          stroke="#B8860B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Endpoint dot */}
        <circle cx="300" cy="10" r="4" fill="#B8860B" />
        <circle cx="300" cy="10" r="7" fill="#B8860B" fillOpacity="0.2" />
        {/* Axis labels */}
        <text x="0" y="118" fill="rgba(156,163,175,0.6)" fontSize="10" fontFamily="DM Sans">Jan&apos;25</text>
        <text x="130" y="118" fill="rgba(156,163,175,0.6)" fontSize="10" fontFamily="DM Sans" textAnchor="middle">Jul&apos;25</text>
        <text x="300" y="118" fill="rgba(156,163,175,0.6)" fontSize="10" fontFamily="DM Sans" textAnchor="end">Jan&apos;26</text>
        {/* Y-axis label */}
        <text x="295" y="60" fill="rgba(156,163,175,0.3)" fontSize="9" fontFamily="DM Sans" textAnchor="end" transform="rotate(-90, 295, 60)">Price</text>
      </svg>
    </div>
  );
}

function ChatIllustration() {
  return (
    <div className="w-full space-y-3 px-2">
      {/* Sent bubble - left aligned (sender) */}
      <div className="flex justify-start">
        <div className="bg-gold-100 dark:bg-gold-500/10 border border-gold-500/20 dark:border-gold-500/30 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[75%]">
          <p className="text-gold-600 dark:text-gold-400 text-sm font-medium">happy birthday beta!</p>
        </div>
      </div>
      {/* Notification bubble - left aligned */}
      <div className="flex justify-start">
        <div className="bg-success-light dark:bg-success/10 border border-success/20 dark:border-success/30 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%]">
          <p className="text-success text-sm font-medium">sent you 0.3g gold<br />(INR 4878.6) on gold.fi</p>
        </div>
      </div>
      {/* Reply bubble - right aligned */}
      <div className="flex justify-end">
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[75%]">
          <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">omggg thanku appa</p>
        </div>
      </div>
    </div>
  );
}

function MapIllustration() {
  return (
    <div className="w-full relative">
      {/* Map background */}
      <div className="bg-[#7DB4D8] dark:bg-[#3A6B8A] rounded-2xl overflow-hidden relative" style={{ aspectRatio: '4/3' }}>
        {/* Road grid */}
        <svg viewBox="0 0 300 225" className="w-full h-full absolute inset-0" fill="none">
          {/* Background blocks (buildings) */}
          <rect x="20" y="20" width="60" height="80" rx="6" fill="#B8860B" fillOpacity="0.25" />
          <rect x="100" y="15" width="50" height="90" rx="6" fill="#B8860B" fillOpacity="0.2" />
          <rect x="170" y="25" width="55" height="75" rx="6" fill="#B8860B" fillOpacity="0.22" />
          <rect x="245" y="20" width="40" height="85" rx="6" fill="#B8860B" fillOpacity="0.15" />
          <rect x="30" y="130" width="70" height="70" rx="6" fill="#B8860B" fillOpacity="0.22" />
          <rect x="120" y="125" width="60" height="75" rx="6" fill="#B8860B" fillOpacity="0.2" />
          <rect x="200" y="135" width="50" height="65" rx="6" fill="#B8860B" fillOpacity="0.25" />
          {/* Roads */}
          <rect x="0" y="105" width="300" height="18" fill="rgba(255,255,255,0.12)" />
          <rect x="155" y="0" width="12" height="225" fill="rgba(255,255,255,0.08)" />
          {/* Map pin */}
          <g transform="translate(140, 85)">
            <circle cx="10" cy="0" r="14" fill="#EF4444" fillOpacity="0.3" />
            <circle cx="10" cy="0" r="8" fill="#EF4444" />
            <circle cx="10" cy="0" r="3" fill="white" />
          </g>
        </svg>
        {/* Jeweller card overlay */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-sm rounded-xl p-3 border border-border-subtle dark:border-[#2D2D2D]">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-text-primary dark:text-[#F0F0F0] text-sm font-semibold">manohar lal jewellers</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="flex">
                  {[1, 2, 3, 4].map((i) => (
                    <svg key={i} className="size-3 text-gold-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <svg className="size-3 text-text-muted dark:text-[#6B7280]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="text-xs text-text-muted dark:text-[#6B7280] ml-1">1.3km away</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-gold-100 dark:bg-gold-500/10 border border-gold-500/20 dark:border-gold-500/30 rounded-lg py-1.5 text-center text-xs font-semibold text-gold-500">
              redeem
            </div>
            <div className="flex-1 bg-surface-elevated dark:bg-[#242424] border border-border-subtle dark:border-[#2D2D2D] rounded-lg py-1.5 text-center text-xs font-semibold text-text-secondary dark:text-[#9CA3AF]">
              directions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Slide Data ---

const AUTO_ADVANCE_MS = 5000;

// --- Main Component ---

export default function LoginPage() {
  const { login, ready, authenticated } = usePrivy();
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slideCount = 4;

  useEffect(() => {
    if (ready && authenticated) {
      router.replace('/');
    }
  }, [ready, authenticated, router]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slideCount);
    }, AUTO_ADVANCE_MS);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const goToSlide = useCallback((index: number) => {
    setActiveSlide(index);
    resetTimer();
  }, [resetTimer]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && activeSlide < slideCount - 1) {
        goToSlide(activeSlide + 1);
      } else if (diff < 0 && activeSlide > 0) {
        goToSlide(activeSlide - 1);
      }
    }
  };

  const features = [
    'pure 24K gold',
    'gold yield (variable rates, risks apply)',
    'backed by Swiss reserves',
    'withdraw anytime, with zero limits',
  ];

  return (
    <div className="w-full min-h-screen bg-surface dark:bg-[#0F0F0F] flex flex-col overflow-hidden">
      {/* Slide Indicators */}
      <motion.div
        className="flex items-center justify-center gap-2 pt-6 pb-4 relative z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.normal, ease: EASE_OUT_EXPO, delay: 0.1 }}
      >
        {Array.from({ length: slideCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className="h-1 rounded-full bg-border relative overflow-hidden"
            style={{ width: i === activeSlide ? 32 : 16 }}
            aria-label={`Go to slide ${i + 1}`}
          >
            <motion.div
              className="absolute inset-0 bg-gold-500 rounded-full"
              initial={false}
              animate={{ scaleX: i === activeSlide ? 1 : 0 }}
              transition={{ duration: DURATION.normal, ease: EASE_OUT_EXPO }}
              style={{ originX: 0 }}
            />
          </button>
        ))}
      </motion.div>

      {/* Slides Container */}
      <div
        className="flex-grow relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          className="flex h-full"
          animate={{ x: `-${activeSlide * 100}%` }}
          transition={{ duration: DURATION.slow, ease: EASE_OUT_EXPO }}
        >
          {/* Slide 1: Invest in Gold */}
          <div className="w-full flex-shrink-0 px-6 flex flex-col">
            <motion.div
              className="flex flex-col items-center pt-4 pb-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.slow, ease: EASE_OUT_EXPO, delay: 0.2 }}
            >
              <motion.div
                className="flex items-center gap-3 mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...SPRING.gentle, delay: 0.3 }}
              >
                <img src="/icon-192x192.png" alt="gold.fi" className="size-12 rounded-xl shadow-lg" />
                <h1 className="text-4xl font-bold text-gold-500 tracking-tight">gold.fi</h1>
              </motion.div>
              <motion.p
                className="text-center text-text-secondary dark:text-[#9CA3AF] text-sm tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: DURATION.normal, delay: 0.5 }}
              >
                Own real gold. Backed 1:1.<br />Secured in Swiss vaults.
              </motion.p>
            </motion.div>
            <motion.div
              className="py-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.normal, ease: EASE_OUT_EXPO, delay: 0.55 }}
            >
              <TolaPriceDisplay className="w-full" />
            </motion.div>
            <div className="py-4 space-y-3">
              {features.map((feature, i) => (
                <motion.div
                  key={feature}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: DURATION.normal, ease: EASE_OUT_EXPO, delay: 0.65 + i * 0.08 }}
                >
                  <div className="size-6 rounded-full bg-success-light dark:bg-success/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="size-4 text-success" />
                  </div>
                  <span className="text-text-secondary dark:text-[#9CA3AF] text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Slide 2: Earn Returns */}
          <div className="w-full flex-shrink-0 px-6 flex flex-col">
            <div className="flex flex-col items-center pt-4 pb-6">
              <div className='flex items-center gap-3 mb-4'>
                <img src="/icon-192x192.png" alt="gold.fi" className="size-10 rounded-xl shadow-md mb-3" />
                <h1 className="text-4xl font-bold text-gold-500 tracking-tight mb-4">gold.fi</h1>
              </div>
              <p className="text-text-primary dark:text-[#F0F0F0] text-lg font-bold text-center leading-snug">
                gold yield<br />(variable rates, risks apply)
              </p>
            </div>
            <div className="flex-grow flex items-start justify-center pt-2">
              <ChartIllustration />
            </div>
          </div>

          {/* Slide 3: Send & Receive */}
          <div className="w-full flex-shrink-0 px-6 flex flex-col">
            <div className="flex flex-col items-center pt-4 pb-6">
              <div className='flex items-center gap-3 mb-4'>
                <img src="/icon-192x192.png" alt="gold.fi" className="size-10 rounded-xl shadow-md mb-3" />
                <h1 className="text-4xl font-bold text-gold-500 tracking-tight mb-4">gold.fi</h1>
              </div>
              <p className="text-text-primary dark:text-[#F0F0F0] text-lg font-bold text-center leading-snug">
                send and receive gold<br />from anyone
              </p>
            </div>
            <div className="flex-grow flex items-start justify-center pt-4">
              <ChatIllustration />
            </div>
          </div>

          {/* Slide 4: Redeem at Jewellers */}
          <div className="w-full flex-shrink-0 px-6 flex flex-col">
            <div className="flex flex-col items-center pt-4 pb-6">
              <div className='flex items-center gap-3 mb-4'>
                <img src="/icon-192x192.png" alt="gold.fi" className="size-10 rounded-xl shadow-md mb-3" />
                <h1 className="text-4xl font-bold text-gold-500 tracking-tight mb-4">gold.fi</h1>
              </div>
              <p className="text-text-primary dark:text-[#F0F0F0] text-lg font-bold text-center leading-snug">
                redeem your gold<br />at 1000+ jewellers across india
              </p>
            </div>
            <div className="flex-grow flex items-start justify-center pt-2">
              <MapIllustration />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fixed CTA Section */}
      <motion.div
        className="px-6 pt-4 pb-8 mb-6 safe-area-bottom relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.slow, ease: EASE_OUT_EXPO, delay: 0.9 }}
      >
        <p className="text-center text-text-muted dark:text-[#6B7280] text-xs mb-4 tracking-wide">
          signing up takes just a minute
        </p>

        <motion.button
          onClick={() => setShowTermsModal(true)}
          className="w-full bg-gold-gradient text-white font-bold py-4 px-6 rounded-full transition-all mb-4 text-lg tracking-wide"
          whileTap={{ scale: 0.97 }}
          transition={SPRING.snappy}
        >
          get started
        </motion.button>
        <motion.button
          onClick={login}
          className="w-full text-text-secondary dark:text-[#9CA3AF] font-medium py-4 px-6 rounded-full hover:border-gold-500/30 hover:text-text-primary dark:hover:text-[#F0F0F0] transition-all"
          whileTap={{ scale: 0.97 }}
          transition={SPRING.snappy}
        >
          already have an account? log in
        </motion.button>
      </motion.div>

      {/* T&C Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            variants={backdropFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => { setShowTermsModal(false); setAgreedToTerms(false); }}
          >
            <motion.div
              className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-border-subtle dark:border-[#2D2D2D] p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              variants={modalScale}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-text-primary dark:text-[#F0F0F0] mb-4 text-center">
                Terms & Conditions
              </h3>
              
              <div className="space-y-4 mb-6">
                <p className="text-sm text-text-secondary dark:text-[#9CA3AF]">
                  {TERMS_AND_CONDITIONS}
                </p>
              </div>

              {/* T&C Checkbox */}
              <label className="flex items-start gap-3 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-border-subtle dark:border-[#2D2D2D] text-gold-500 focus:ring-gold-500"
                />
                <span className="text-sm text-text-secondary dark:text-[#9CA3AF] leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-gold-500 hover:underline">Terms & Conditions</a>,{' '}
                  Marketing Communications, and{' '}
                  <a href="#" className="text-gold-500 hover:underline">Privacy Policy</a>.
                </span>
              </label>

              <motion.button
                onClick={() => {
                  if (agreedToTerms) {
                    setShowTermsModal(false);
                    login();
                  }
                }}
                disabled={!agreedToTerms}
                className="w-full bg-gold-gradient text-white font-bold py-4 px-6 rounded-full transition-all mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.97 }}
                transition={SPRING.snappy}
              >
                create account
              </motion.button>
              
              <motion.button
                onClick={() => {
                  setShowTermsModal(false);
                  setAgreedToTerms(false);
                }}
                className="w-full bg-white dark:bg-[#1A1A1A] border border-border-subtle dark:border-[#2D2D2D] text-text-secondary dark:text-[#9CA3AF] font-medium py-3 px-6 rounded-full hover:border-gold-500/30 transition-all"
                whileTap={{ scale: 0.97 }}
                transition={SPRING.snappy}
              >
                cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
