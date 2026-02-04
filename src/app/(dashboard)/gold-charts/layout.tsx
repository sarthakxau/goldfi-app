import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gold Charts',
  description: 'Track gold prices with live charts and historical data.',
};

export default function GoldChartsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
