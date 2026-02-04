import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transactions',
  description: 'View your transaction history and track all your gold purchases and sales.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
