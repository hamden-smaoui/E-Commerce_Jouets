import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("📥 Google auth proxy - Requête reçue:", body);

    // ✅ Appelle le backend Express
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google-auth`,
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
    console.log("📦 Backend response status:", response.status);
    console.log("📦 Backend response data:", data);

    if (!response.ok) {
      console.error("❌ Erreur backend:", data);
      return NextResponse.json(data, { status: response.status });
    }

    // ✅ Récupère tous les cookies du backend
    const setCookieHeaders = response.headers.getSetCookie();
    console.log("🍪 Cookies from backend:", setCookieHeaders);
    
    // ✅ Crée la réponse Next.js
    const nextResponse = NextResponse.json(data);

    // ✅ Propage TOUS les cookies au navigateur
    setCookieHeaders.forEach(cookie => {
      nextResponse.headers.append('Set-Cookie', cookie);
    });

    console.log("✅ Réponse Google auth envoyée avec cookies");
    return nextResponse;

  } catch (error: any) {
    console.error('❌ Erreur google-auth-proxy:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}