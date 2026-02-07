import { MetadataRoute } from 'next';
import { APP } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/login', '/buy', '/sell', '/account', '/transactions', '/card'],
    },
    sitemap: `${APP.DOMAIN}sitemap.xml`,
  };
}
