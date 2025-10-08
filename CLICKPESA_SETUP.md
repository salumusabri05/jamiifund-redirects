# ClickPesa & Supabase Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
Already done! The following packages are installed:
- `@supabase/supabase-js` - Supabase client
- `axios` - HTTP client for API calls
- `dotenv` - Environment variable management
- `cors` - Not needed for Next.js API routes (built-in)

### 2. Configure Environment Variables

Edit `.env.local` and add your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# ClickPesa Configuration
CLICKPESA_CLIENT_ID=your_clickpesa_client_id_here
CLICKPESA_API_KEY=your_clickpesa_api_key_here

# Server Configuration
PORT=3001
```

#### Getting Supabase Credentials:
1. Go to [https://supabase.com](https://supabase.com)
2. Create a project or open existing one
3. Go to Project Settings → API
4. Copy `URL` and `anon/public` key

#### Getting ClickPesa Credentials:
1. Sign up at ClickPesa
2. Get your `client-id` and `api-key` from the dashboard

### 3. Create Supabase Tables (Optional)

If you want to log payments, create this table in Supabase:

```sql
CREATE TABLE payment_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_reference TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL,
  response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add an index for faster queries
CREATE INDEX idx_payment_logs_order_ref ON payment_logs(order_reference);
CREATE INDEX idx_payment_logs_created_at ON payment_logs(created_at DESC);
```

For campaigns (if testing Supabase connection):

```sql
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  goal_amount DECIMAL(10, 2),
  current_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO campaigns (title, description, goal_amount) 
VALUES ('Medical Fund', 'Help raise funds for medical expenses', 10000);
```

### 4. Run the Development Server

```bash
npm run dev
```

### 5. Test the Integration

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Click on "ClickPesa Tester" card
3. Test Supabase connection first
4. Fill in the payment form and test

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── clickpesa/
│   │       ├── generate-token/
│   │       │   └── route.js          # Generates ClickPesa bearer token
│   │       └── initiate-payment/
│   │           └── route.js          # Initiates USSD push payment
│   └── test-clickpesa/
│       └── page.js                   # Testing UI
├── lib/
│   └── supabase.js                   # Supabase client configuration
```

## 🔧 API Endpoints

### POST `/api/clickpesa/generate-token`
Generates and caches a ClickPesa bearer token (valid for 1.5 hours).

**Response:**
```json
{
  "token": "bearer_token_here"
}
```

### POST `/api/clickpesa/initiate-payment`
Initiates a USSD push payment request.

**Request Body:**
```json
{
  "amount": 1000,
  "phoneNumber": "255712345678",
  "orderReference": "ORDER123456",
  "checksum": "optional_checksum"
}
```

**Response:**
```json
{
  "status": "success",
  "transactionId": "TXN123456",
  "message": "Payment initiated successfully"
}
```

## 🧪 Testing Flow

1. **Test Supabase Connection**
   - Click "Test Connection" button
   - Should show "✅ Connected successfully"

2. **Test Payment Initiation**
   - Enter amount (e.g., 1000 TZS)
   - Enter phone number (255XXXXXXXXX format)
   - Order reference is auto-generated
   - Click "Initiate Payment"
   - Check the response in the green box

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use environment variables for all sensitive data
- ClickPesa credentials are only used in API routes (server-side)
- Supabase Row Level Security (RLS) should be enabled in production

## 📝 Next Steps

- [ ] Add webhook endpoint to receive payment confirmations
- [ ] Implement payment status checking
- [ ] Add transaction history table
- [ ] Integrate with existing payment flow pages
- [ ] Add proper error handling and retries
- [ ] Implement logging and monitoring

## 🐛 Troubleshooting

**Supabase connection fails:**
- Check if URL and key are correct in `.env.local`
- Ensure the table exists in Supabase
- Check Supabase project is active

**ClickPesa payment fails:**
- Verify credentials are correct
- Check if phone number format is correct (255XXXXXXXXX)
- Ensure amount is sufficient (minimum may apply)
- Check ClickPesa API status

**Token generation fails:**
- Verify `CLICKPESA_CLIENT_ID` and `CLICKPESA_API_KEY`
- Check if credentials have proper permissions
- Restart dev server after changing env variables

## 📞 Support

For issues with:
- **ClickPesa API:** Contact ClickPesa support
- **Supabase:** Check [Supabase Documentation](https://supabase.com/docs)
- **This Integration:** Check console logs and API responses
