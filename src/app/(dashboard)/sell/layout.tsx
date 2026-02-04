import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sell Gold',
  description: 'Sell your digital gold instantly. Convert gold to USDT with instant settlements.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
