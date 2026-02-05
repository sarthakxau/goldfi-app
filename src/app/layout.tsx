import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://tola-one.vercel.app'),
  title: {
    template: '%s | tola',
    default: 'tola - Digital Gold Savings',
  },
  description: 'Save in digital gold with zero fees. Buy and sell gold in grams with instant settlements on tola.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'tola',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'tola',
    title: 'tola - Digital Gold Savings',
    description: 'Save in digital gold with zero fees. Buy and sell gold in grams with instant settlements.',
    images: [
      {
        url: '/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'tola - Gold Savings',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'tola - Digital Gold Savings',
    description: 'Save in digital gold with zero fees. Buy and sell gold in grams with instant settlements.',
    images: ['/icon-512x512.png'],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#B8860B' },
    { media: '(prefers-color-scheme: dark)', color: '#0F0F0F' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('tola-theme');
                  var theme = stored || 'system';
                  var resolved = theme;
                  if (theme === 'system') {
                    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.classList.add(resolved);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-surface dark:bg-[#0F0F0F] antialiased transition-colors">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
