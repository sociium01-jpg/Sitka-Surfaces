import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sitka Surfaces',
    short_name: 'Sitka',
    description: 'Bespoke Premium Plywood, Laminates, Veneer, and Decoratives',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0b09',
    theme_color: '#b9502a',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
