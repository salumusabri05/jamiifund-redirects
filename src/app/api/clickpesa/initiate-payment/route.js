import { NextResponse } from 'next/server';
import https from 'https';

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

async function getToken() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/clickpesa/generate-token`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to get token');
  }
  
  const data = await response.json();
  return data.token;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, phoneNumber, orderReference, checksum } = body;

    console.log('Payment request received:', { amount, phoneNumber, orderReference });

    // Validate input
    if (!amount || !phoneNumber || !orderReference) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, phoneNumber, or orderReference' },
        { status: 400 }
      );
    }

    // Get token
    console.log('Getting ClickPesa token...');
    const token = await getToken();
    console.log('Token received');

    // Prepare payment data
    const paymentData = {
      amount: parseFloat(amount),
      currency: 'TZS',
      orderReference,
      phoneNumber,
      ...(checksum && { checksum })
    };

    console.log('Initiating USSD push with data:', paymentData);

    // Initiate USSD push using fetch (as per ClickPesa docs)
    const url = 'https://api.clickpesa.com/third-parties/payments/initiate-ussd-push-request';
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    };

    console.log('Fetching payment from:', url);
    console.log('Token (first 10 chars):', token?.substring(0, 10) + '...');

    const response = await secureFetch(url, options).catch(err => {
      console.error('Payment fetch error details:', {
        message: err.message,
        cause: err.cause,
        code: err.code,
        type: err.constructor.name
      });
      throw err;
    });
    
    console.log('Payment response status:', response.status);
    const data = await response.json();

    if (!response.ok) {
      console.error('ClickPesa API error:', data);
      throw new Error(data.message || 'Payment initiation failed');
    }

    console.log('Payment initiated successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Payment initiation error:', {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to initiate payment',
        details: error.message
      },
      { status: 500 }
    );
  }
}
