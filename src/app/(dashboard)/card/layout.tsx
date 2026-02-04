import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gold Card',
  description: 'View your digital gold card and share your holdings.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
