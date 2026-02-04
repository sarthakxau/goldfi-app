import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buy Gold',
  description: 'Buy digital gold instantly with zero fees. Convert USDT to gold in grams.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BuyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
