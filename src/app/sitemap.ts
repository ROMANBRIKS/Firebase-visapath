import { MetadataRoute } from 'next';
import { initializeFirebase } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://visapath-guides.web.app';
  
  // Basic static routes
  const routes = [
    '',
    '/guides',
    '/match',
    '/support',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic routes for guides (attempting to fetch from Firestore)
  let guideRoutes: MetadataRoute.Sitemap = [];
  try {
    const { firestore } = initializeFirebase();
    const guidesSnapshot = await getDocs(collection(firestore, 'visaGuides'));
    guideRoutes = guidesSnapshot.docs.map((doc) => ({
      url: `${baseUrl}/guides/${doc.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Sitemap generation error:', error);
  }

  return [...routes, ...guideRoutes];
}
