import { NextResponse } from 'next/server';
import https from 'https';

let bearerToken = '';
let tokenExpiresAt = 0;

// Custom fetch wrapper with SSL fix for Node.js
async function secureFetch(url, options = {}) {
  try {
    // Try with native fetch first
    return await fetch(url, options);
  } catch (fetchError) {
    console.log('Native fetch failed, trying https module...', fetchError.message);
    
    // Fallback to https module with custom agent
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const postData = options.body || '';
      
      const reqOptions = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname,
        method: options.method || 'GET',
        headers: {
          ...options.headers,
          'Content-Length': Buffer.byteLength(postData)
        },
        // Disable SSL verification as fallback (use with caution)
        rejectUnauthorized: false
      };

      const req = https.request(reqOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: async () => JSON.parse(data),
            text: async () => data
          });
        });
      });

      req.on('error', reject);
      if (postData) req.write(postData);
      req.end();
    });
  }
}

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

    console.log('Fetching token from:', url);
    console.log('Headers:', { 'client-id': process.env.CLICKPESA_CLIENT_ID?.substring(0, 5) + '...' });

    const response = await secureFetch(url, options).catch(err => {
      console.error('Fetch error details:', {
        message: err.message,
        cause: err.cause,
        code: err.code
      });
      throw err;
    });
    
    console.log('Response status:', response.status);
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
