import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // ✅ Les cookies sont envoyés automatiquement via credentials: 'include'
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-token`,
      {
        method: 'POST',
        credentials: 'include', // ✅ Envoie le refreshToken cookie
        headers: {
          'Cookie': request.headers.get('cookie') || '', // Forward cookies
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const nextResponse = NextResponse.json(data);

    // Propage les nouveaux cookies si présents
    const setCookieHeader = response.headers.getSetCookie();
    setCookieHeader.forEach(cookie => {
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