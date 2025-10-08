import { NextResponse } from 'next/server';
import axios from 'axios';

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
    
    // Generate new token
    const response = await axios.post(
      'https://api.clickpesa.com/third-parties/generate-token',
      {},
      {
        headers: {
          'client-id': process.env.CLICKPESA_CLIENT_ID,
          'api-key': process.env.CLICKPESA_API_KEY
        }
      }
    );

    bearerToken = response.data.token;
    tokenExpiresAt = now + 90 * 60 * 1000; // 1.5 hours

    console.log('Token generated successfully');
    return NextResponse.json({ token: bearerToken });
  } catch (error) {
    console.error('Token generation error:', error.response?.data || error.message);
    console.error('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return NextResponse.json(
      { 
        error: 'Failed to generate token', 
        details: error.response?.data?.message || error.response?.data || error.message,
        status: error.response?.status
      },
      { status: error.response?.status || 500 }
    );
  }
}
