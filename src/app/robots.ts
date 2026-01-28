import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://frioingenieriamx.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/test-db/',
          '/_next/',
          '/admin/',
          '/*.json$',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/test-db/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/test-db/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
