import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sitkasurfaces.com';

  const staticRoutes = [
    '',
    '/about',
    '/inspiration',
    '/journal',
    '/contact',
    '/privacy',
    '/terms',
    '/sitemap',
    '/surfaces/plywood',
    '/surfaces/laminates',
    '/surfaces/veneer',
    '/surfaces/decoratives',
  ];

  const routes = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
