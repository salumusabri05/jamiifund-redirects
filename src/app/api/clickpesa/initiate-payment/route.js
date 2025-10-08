import { NextResponse } from 'next/server';
import axios from 'axios';

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
    const { amount, phoneNumber, orderReference, checksum } = await request.json();

    // Validate input
    if (!amount || !phoneNumber || !orderReference) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, phoneNumber, or orderReference' },
        { status: 400 }
      );
    }

    // Get token
    const token = await getToken();

    // Initiate USSD push
    const response = await axios.post(
      'https://api.clickpesa.com/third-parties/payments/initiate-ussd-push-request',
      {
        amount,
        currency: 'TZS',
        orderReference,
        phoneNumber,
        checksum: checksum || ''
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Payment initiation error:', error.response?.data || error.message);
    return NextResponse.json(
      { 
        error: 'Failed to initiate payment',
        details: error.response?.data || error.message 
      },
      { status: 500 }
    );
  }
}
