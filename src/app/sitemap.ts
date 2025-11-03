import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.bambyjoy.com'

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  try {
    // ✅ Appel direct à votre API backend avec fetch (pas d'axios, pas de sessionStorage)
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'
    
    const response = await fetch(`${API_BASE_URL}/produits`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', // Pour avoir toujours les données à jour
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const produits = await response.json()
    

    // ✅ Vérifier que produits existe et est un tableau
    if (!produits || !Array.isArray(produits) || produits.length === 0) {
      return staticPages
    }

    // ✅ Créer une entrée pour chaque produit
    const productPages: MetadataRoute.Sitemap = produits.map((produit: any) => ({
      url: `${baseUrl}/products/${produit.idProduit}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    
    return [...staticPages, ...productPages]
  } catch (error) {
    return staticPages
  }
}