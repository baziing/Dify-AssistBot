import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'POST');
}

async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  const apiUrl = process.env.NEXT_PUBLIC_DIFY_API_URL;
  const apiKey = process.env.NEXT_PUBLIC_DIFY_API_KEY;

  if (!apiUrl || !apiKey) {
    return NextResponse.json(
      { error: 'API configuration missing' },
      { status: 500 }
    );
  }

  const baseUrl = apiUrl.replace(/\/$/, '');
  const targetUrl = `${baseUrl}/${pathSegments.join('/')}`;
  
  console.log('Proxying request to:', targetUrl);
  
  try {
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${apiKey}`);
    headers.set('Content-Type', 'application/json');

    const response = await fetch(targetUrl, {
      method: method,
      headers: headers,
      body: method === 'POST' ? await request.text() : undefined,
    });

    const responseHeaders = new Headers(response.headers);
    const body = await response.text();

    console.log('Proxy response:', {
      status: response.status,
      statusText: response.statusText,
      body: body.substring(0, 200) + (body.length > 200 ? '...' : '')
    });

    return new NextResponse(body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 500 }
    );
  }
} 