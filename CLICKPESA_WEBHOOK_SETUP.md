# 🔔 ClickPesa Webhook Setup Guide

## Overview
This guide explains how to set up and test ClickPesa webhooks to receive real-time payment status updates.

## Webhook Endpoint

**URL:** `https://your-domain.com/api/webhooks/clickpesa`

**Methods:** 
- `POST` - Receives webhook notifications from ClickPesa
- `GET` - Health check endpoint

## Setup Instructions

### 1. Configure Webhook URL in ClickPesa Dashboard

1. Log in to your [ClickPesa Dashboard](https://dashboard.clickpesa.com)
2. Navigate to **Settings** → **Webhooks**
3. Add your webhook URL:
   ```
   https://your-domain.com/api/webhooks/clickpesa
   ```
4. Select the events you want to receive:
   - ✅ Payment Initiated
   - ✅ Payment Completed
   - ✅ Payment Failed
   - ✅ Payment Cancelled

5. Save the webhook configuration

### 2. Create Database Tables

Create the following tables in your Supabase database:

#### `clickpesa_webhooks` Table
```sql
CREATE TABLE clickpesa_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id VARCHAR(255),
  order_reference VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'TZS',
  status VARCHAR(50),
  phone_number VARCHAR(20),
  message TEXT,
  raw_data JSONB,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_order_reference ON clickpesa_webhooks(order_reference);
CREATE INDEX idx_transaction_id ON clickpesa_webhooks(transaction_id);
CREATE INDEX idx_status ON clickpesa_webhooks(status);
```

#### Update `payment_logs` Table
```sql
-- Add webhook tracking columns
ALTER TABLE payment_logs ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);
ALTER TABLE payment_logs ADD COLUMN IF NOT EXISTS webhook_received_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE payment_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

### 3. Test Webhook Locally (Development)

#### Using ngrok:

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Start your development server:**
   ```bash
   npm run dev
   ```

3. **Expose your local server:**
   ```bash
   ngrok http 3000
   ```

4. **Copy the ngrok URL:**
   ```
   https://abc123.ngrok.io
   ```

5. **Update ClickPesa webhook URL:**
   ```
   https://abc123.ngrok.io/api/webhooks/clickpesa
   ```

#### Using Hookdeck (Alternative):
```bash
npx hookdeck listen 3000
```

### 4. Test Webhook

#### Test with cURL:
```bash
curl -X POST https://your-domain.com/api/webhooks/clickpesa \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TXN123456789",
    "orderReference": "ORDER1234567890",
    "amount": 1000,
    "currency": "TZS",
    "status": "completed",
    "phoneNumber": "255712345678",
    "timestamp": "2025-10-08T12:00:00Z",
    "message": "Payment completed successfully"
  }'
```

#### Check if endpoint is active:
```bash
curl https://your-domain.com/api/webhooks/clickpesa
```

Expected response:
```json
{
  "status": "active",
  "endpoint": "/api/webhooks/clickpesa",
  "message": "ClickPesa webhook endpoint is active",
  "timestamp": "2025-10-08T12:00:00.000Z"
}
```

## Webhook Event Types

### Payment Status Values

| Status | Description | Action |
|--------|-------------|--------|
| `initiated` | Payment request sent to user | Show pending state |
| `pending` | User received prompt, awaiting PIN | Show waiting state |
| `completed` | Payment successful | Update to success, credit account |
| `success` | Payment successful (alternative) | Update to success, credit account |
| `successful` | Payment successful (alternative) | Update to success, credit account |
| `failed` | Payment failed | Show error, allow retry |
| `failure` | Payment failed (alternative) | Show error, allow retry |
| `cancelled` | User cancelled payment | Show cancelled state |
| `canceled` | User cancelled (alternative) | Show cancelled state |

### Example Webhook Payload

#### Successful Payment:
```json
{
  "transactionId": "CP_TXN_20251008_123456",
  "orderReference": "ORDER1728393600000",
  "amount": 5000,
  "currency": "TZS",
  "status": "completed",
  "phoneNumber": "255712345678",
  "timestamp": "2025-10-08T14:30:00Z",
  "message": "Payment completed successfully",
  "metadata": {
    "campaign": "Medical Fund",
    "donor": "John Doe"
  }
}
```

#### Failed Payment:
```json
{
  "transactionId": "CP_TXN_20251008_123457",
  "orderReference": "ORDER1728393600001",
  "amount": 5000,
  "currency": "TZS",
  "status": "failed",
  "phoneNumber": "255712345678",
  "timestamp": "2025-10-08T14:35:00Z",
  "message": "Insufficient funds",
  "errorCode": "INSUFFICIENT_BALANCE"
}
```

## Security Best Practices

### 1. Verify Webhook Signature (Recommended)
```javascript
import crypto from 'crypto';

function verifyWebhookSignature(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}
```

### 2. Validate IP Address
Add ClickPesa's webhook IPs to your allowlist.

### 3. Use HTTPS
Always use HTTPS in production for webhook URLs.

### 4. Implement Idempotency
Handle duplicate webhook events by checking `transactionId`.

## Monitoring

### View Webhook Logs in Supabase
```sql
-- Recent webhooks
SELECT * FROM clickpesa_webhooks 
ORDER BY received_at DESC 
LIMIT 50;

-- Failed payments today
SELECT * FROM clickpesa_webhooks 
WHERE status = 'failed' 
  AND received_at > NOW() - INTERVAL '1 day';

-- Successful payments by amount
SELECT 
  SUM(amount) as total_amount,
  COUNT(*) as payment_count
FROM clickpesa_webhooks 
WHERE status IN ('completed', 'success', 'successful')
  AND received_at > NOW() - INTERVAL '30 days';
```

### Server Logs
Check your application logs for webhook processing:
```bash
# In your deployment platform (Vercel, Netlify, etc.)
tail -f /var/log/application.log | grep "ClickPesa Webhook"
```

## Troubleshooting

### Webhook Not Received

1. **Check ClickPesa Dashboard:**
   - Verify webhook URL is correct
   - Check if webhook is enabled
   - Look for delivery failures

2. **Verify Endpoint:**
   ```bash
   curl https://your-domain.com/api/webhooks/clickpesa
   ```

3. **Check Server Logs:**
   - Look for incoming requests
   - Check for errors in webhook processing

4. **Test Locally with ngrok:**
   - Expose local server
   - Update webhook URL temporarily
   - Make a test payment

### Webhook Received But Not Saved

1. **Check Supabase Connection:**
   ```bash
   # Test Supabase connection
   curl https://your-domain.com/api/diagnostics
   ```

2. **Verify Table Exists:**
   ```sql
   SELECT * FROM clickpesa_webhooks LIMIT 1;
   ```

3. **Check RLS Policies:**
   ```sql
   -- Disable RLS temporarily for testing
   ALTER TABLE clickpesa_webhooks DISABLE ROW LEVEL SECURITY;
   ```

### Duplicate Webhooks

ClickPesa may send the same webhook multiple times. Handle idempotency:

```javascript
// Check if webhook already processed
const { data: existing } = await supabase
  .from('clickpesa_webhooks')
  .select('id')
  .eq('transaction_id', transactionId)
  .single();

if (existing) {
  console.log('Webhook already processed');
  return NextResponse.json({ success: true, message: 'Already processed' });
}
```

## Integration with Mobile App

### Notify User After Webhook
```javascript
// In webhook handler after successful payment
async function notifyUser(orderReference, status) {
  // Option 1: Push notification
  await sendPushNotification(userId, {
    title: 'Payment Successful',
    body: `Your payment of TZS ${amount} was successful`
  });

  // Option 2: Update database flag that app polls
  await supabase
    .from('payment_status')
    .update({ status, updated_at: new Date() })
    .eq('order_reference', orderReference);
}
```

### App Polling Strategy
```javascript
// In mobile app
async function pollPaymentStatus(orderReference) {
  const maxAttempts = 30; // 30 seconds
  let attempts = 0;

  const interval = setInterval(async () => {
    const { data } = await supabase
      .from('payment_logs')
      .select('status')
      .eq('order_reference', orderReference)
      .single();

    if (data.status === 'completed' || attempts >= maxAttempts) {
      clearInterval(interval);
      // Handle result
    }
    attempts++;
  }, 1000);
}
```

## Production Checklist

- [ ] Webhook URL configured in ClickPesa dashboard
- [ ] Database tables created (`clickpesa_webhooks`, `payment_logs`)
- [ ] HTTPS enabled
- [ ] Error logging configured
- [ ] Monitoring alerts set up
- [ ] Tested with real transactions
- [ ] Idempotency handling implemented
- [ ] User notifications configured
- [ ] Backup webhook handler (if needed)

## Support

For ClickPesa webhook issues:
- **Documentation:** https://docs.clickpesa.com
- **Support:** support@clickpesa.com
- **Dashboard:** https://dashboard.clickpesa.com

For application issues:
- **GitHub:** https://github.com/salumusabri05/jamiifund-redirects/issues

---

Made with 💜 by JamiiFund Team
