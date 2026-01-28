import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://frioingenieriamx.com'
  const currentDate = new Date().toISOString()

  // Páginas estáticas principales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/servicios`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/proyectos`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/refacciones`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nosotros`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/recursos`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  // Páginas adicionales para SEO (landing pages virtuales para palabras clave)
  const keywordPages: MetadataRoute.Sitemap = [
    // Estas URLs pueden ser implementadas como páginas dinámicas o redirecciones
    // Por ahora las incluimos para indicar la estructura ideal del sitemap
  ]

  return [...staticPages, ...keywordPages]
}
