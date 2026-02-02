'use client';

import { useEffect, useRef, memo } from 'react';
import { useTheme } from '@/lib/theme';

interface TradingViewWidgetProps {
  symbol: string;
}

function TradingViewWidget({ symbol }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    const isDark = resolvedTheme === 'dark';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      allow_symbol_change: false,
      calendar: false,
      details: false,
      hide_side_toolbar: true,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_volume: true,
      hotlist: false,
      interval: 'D',
      locale: 'en',
      save_image: false,
      style: '1',
      symbol: symbol,
      theme: isDark ? 'dark' : 'light',
      timezone: 'Asia/Kolkata',
      backgroundColor: isDark ? '#0F0F0F' : '#FFFFFF',
      gridColor: isDark ? 'rgba(242, 242, 242, 0.06)' : 'rgba(0, 0, 0, 0.06)',
      watchlist: [],
      withdateranges: true,
      compareSymbols: [],
      studies: [],
      autosize: true,
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [symbol, resolvedTheme]);

  return (
    <div
      className="tradingview-widget-container"
      ref={containerRef}
      style={{ height: '100%', width: '100%' }}
    />
  );
}

export default memo(TradingViewWidget);
