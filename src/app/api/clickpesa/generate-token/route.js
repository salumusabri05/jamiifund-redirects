import { NextResponse } from 'next/server';

let bearerToken = '';
let tokenExpiresAt = 0;

export async function POST() {
  try {
    const now = Date.now();
    
    // Check if environment variables are set
    if (!process.env.CLICKPESA_CLIENT_ID || !process.env.CLICKPESA_API_KEY) {
      console.error('ClickPesa credentials not configured');
      return NextResponse.json(
        { 
          error: 'ClickPesa credentials not configured',
          details: 'Please add CLICKPESA_CLIENT_ID and CLICKPESA_API_KEY to .env.local'
        },
        { status: 500 }
      );
    }
    
    // Return cached token if still valid
    if (bearerToken && now < tokenExpiresAt) {
      console.log('Using cached token');
      return NextResponse.json({ token: bearerToken });
    }

    console.log('Generating new ClickPesa token...');
    
    // Generate new token using fetch
    const url = 'https://api.clickpesa.com/third-parties/generate-token';
    const options = {
      method: 'POST',
      headers: {
        'client-id': process.env.CLICKPESA_CLIENT_ID,
        'api-key': process.env.CLICKPESA_API_KEY
      }
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      console.error('ClickPesa token generation failed:', data);
      throw new Error(data.message || 'Token generation failed');
    }

    bearerToken = data.token;
    tokenExpiresAt = now + 90 * 60 * 1000; // 1.5 hours

    console.log('Token generated successfully');
    return NextResponse.json({ token: bearerToken });
  } catch (error) {
    console.error('Token generation error:', error.message);
    return NextResponse.json(
      { 
        error: 'Failed to generate token', 
        details: error.message
      },
      { status: error.response?.status || 500 }
    );
  }
}
