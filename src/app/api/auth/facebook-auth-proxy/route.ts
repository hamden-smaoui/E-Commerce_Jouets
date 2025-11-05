import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ✅ Appelle le backend Express
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/facebook-auth`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // ✅ Récupère tous les cookies du backend
    const setCookieHeaders = response.headers.getSetCookie();
    
    // ✅ Crée la réponse Next.js
    const nextResponse = NextResponse.json(data);

    // ✅ Propage TOUS les cookies au navigateur
    setCookieHeaders.forEach(cookie => {
      nextResponse.headers.append('Set-Cookie', cookie);
    });

    return nextResponse;

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}