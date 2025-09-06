// pages/api/auth/google-signin.ts
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  try {
    const { email, name, googleId, image } = req.body
    
    // Appeler votre backend pour créer/connecter l'utilisateur Google
    const response = await fetch(`${process.env.API_BASE_URL}/auth/google-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name,
        googleId,
        image
      }),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de l\'authentification Google')
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error instanceof Error ? error.message : 'Erreur inconnue' })
  }
}