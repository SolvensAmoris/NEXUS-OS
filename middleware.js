export const config = { matcher: '/premium/:path*' };

export default async function middleware(request) {
  const tokenMatch = request.headers.get('cookie')?.match(/nexus-auth-token=([^;]+)/);
  if (!tokenMatch) return new Response('Acceso Denegado', { status: 401 });

  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/suscripciones?select=estado_pago`, {
    headers: { 'Authorization': `Bearer ${tokenMatch[1]}`, 'apikey': process.env.SUPABASE_ANON_KEY }
  });
  
  const data = await response.json();
  if (data?.[0]?.estado_pago !== 'paid') return new Response('Acceso Prohibido', { status: 403 });
  return;
}
