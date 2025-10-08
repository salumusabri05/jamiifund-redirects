import { NextResponse } from 'next/server';

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

    const response = await fetch(url, options);
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
