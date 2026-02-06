import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { APP } from '@/lib/constants';

export const metadata: Metadata = {
  metadataBase: new URL(APP.DOMAIN),
  title: {
    template: `%s | ${APP.NAME}`,
    default: APP.TITLE,
  },
  description: APP.DESCRIPTION,
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP.NAME,
  },
  openGraph: {
    type: 'website',
    locale: APP.LOCALE,
    url: '/',
    siteName: APP.NAME,
    title: APP.TITLE,
    description: APP.DESCRIPTION,
    images: [
      {
        url: '/icon-512x512.png',
        width: 512,
        height: 512,
        alt: APP.TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: APP.TITLE,
    description: APP.DESCRIPTION,
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
    { media: '(prefers-color-scheme: light)', color: APP.THEME.LIGHT },
    { media: '(prefers-color-scheme: dark)', color: APP.THEME.DARK },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={APP.LOCALE} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('${APP.THEME.STORAGE_KEY}');
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
      {/* Note: dark:bg-[#0F0F0F] must match APP.THEME.DARK - Tailwind requires static class names */}
      <body className="min-h-screen bg-surface dark:bg-[#0F0F0F] antialiased transition-colors">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
