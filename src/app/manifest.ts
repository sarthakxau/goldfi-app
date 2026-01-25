import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'tola - Gold Savings',
    short_name: 'tola',
    description: 'Invest in gold with zero fees',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#F59E0B',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
