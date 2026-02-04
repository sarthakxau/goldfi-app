import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/login', '/buy', '/sell', '/account', '/transactions', '/card'],
    },
    sitemap: 'https://tola-one.vercel.app/sitemap.xml',
  };
}
