import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/cart/'],
    },
    sitemap: 'https://visapath-guides.web.app/sitemap.xml',
  };
}
