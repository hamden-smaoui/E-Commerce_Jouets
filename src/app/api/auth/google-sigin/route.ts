// app/api/auth/google-signin/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, name, googleId, image } = await req.json()
    
    // Appeler ton backend pour créer/connecter l'utilisateur Google
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google-auth`, {
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
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur Google auth:', error)
    return NextResponse.json(
      { message: 'Erreur serveur', error: (error as Error).message }, 
      { status: 500 }
    )
  }
}