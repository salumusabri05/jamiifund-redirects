import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * ClickPesa Webhook Handler
 * Receives payment status updates from ClickPesa
 * 
 * Webhook events include:
 * - Payment initiated
 * - Payment completed
 * - Payment failed
 * - Payment cancelled
 */

export async function POST(request) {
  try {
    // Get the raw body for verification if needed
    const body = await request.json();
    
    console.log('=== ClickPesa Webhook Received ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Webhook Data:', JSON.stringify(body, null, 2));

    // Extract webhook data
    const {
      transactionId,
      orderReference,
      amount,
      currency,
      status,
      phoneNumber,
      timestamp,
      message,
      ...otherData
    } = body;

    // Validate required fields
    if (!orderReference) {
      console.error('Missing orderReference in webhook');
      return NextResponse.json(
        { error: 'Missing orderReference' },
        { status: 400 }
      );
    }

    // Log webhook to database
    try {
      const webhookLog = {
        transaction_id: transactionId,
        order_reference: orderReference,
        amount: amount,
        currency: currency || 'TZS',
        status: status,
        phone_number: phoneNumber,
        message: message,
        raw_data: body,
        received_at: new Date().toISOString()
      };

      const { data: logData, error: logError } = await supabase
        .from('clickpesa_webhooks')
        .insert(webhookLog)
        .select();

      if (logError) {
        console.error('Failed to log webhook to database:', logError);
      } else {
        console.log('Webhook logged to database:', logData);
      }

      // Update payment status if exists in payment_logs
      if (orderReference) {
        const { data: updateData, error: updateError } = await supabase
          .from('payment_logs')
          .update({
            status: status,
            transaction_id: transactionId,
            webhook_received_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('order_reference', orderReference)
          .select();

        if (updateError) {
          console.warn('Could not update payment_logs:', updateError);
        } else {
          console.log('Payment log updated:', updateData);
        }
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue processing even if DB fails
    }

    // Handle different webhook statuses
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
      case 'successful':
        console.log(`✅ Payment ${orderReference} completed successfully`);
        // TODO: Notify user, update app state, etc.
        break;

      case 'failed':
      case 'failure':
        console.log(`❌ Payment ${orderReference} failed`);
        // TODO: Handle failed payment
        break;

      case 'pending':
      case 'initiated':
        console.log(`⏳ Payment ${orderReference} is pending`);
        // TODO: Update status to pending
        break;

      case 'cancelled':
      case 'canceled':
        console.log(`🚫 Payment ${orderReference} was cancelled`);
        // TODO: Handle cancellation
        break;

      default:
        console.log(`ℹ️ Payment ${orderReference} status: ${status}`);
    }

    // Return success response to ClickPesa
    return NextResponse.json({
      success: true,
      message: 'Webhook received and processed',
      orderReference: orderReference,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Still return 200 to prevent retries for malformed requests
    return NextResponse.json(
      {
        success: false,
        error: 'Webhook processing failed',
        message: error.message
      },
      { status: 200 }
    );
  }
}

// Handle GET requests (for webhook verification/testing)
export async function GET(request) {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/webhooks/clickpesa',
    message: 'ClickPesa webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
