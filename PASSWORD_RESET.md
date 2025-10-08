# 🔐 Password Reset Feature

## Overview
The password reset feature allows users to securely reset their JamiiFund account password using Supabase Auth.

## Features

### ✨ User Experience
- **Beautiful Animated UI** with floating particles and gradient backgrounds
- **Real-time Password Strength Indicator** (Weak/Medium/Strong)
- **Live Validation** with visual feedback
- **Smooth Animations** for all interactions
- **Mobile Responsive** design
- **Brand Color Integration** (#8A2BE2)

### 🔒 Security Features
- **Minimum 8 characters** required
- **Password strength validation** (uppercase, lowercase, numbers, symbols)
- **Secure token-based reset** via Supabase Auth
- **Session validation** before allowing password change
- **Match confirmation** before submission

## How It Works

### 1. User Requests Password Reset (From Mobile App)
```javascript
// Call from your mobile app
const response = await fetch('https://your-domain.com/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});
```

### 2. Supabase Sends Email
- User receives email with secure reset link
- Link contains access token: `https://your-domain.com/forgot-password?token=xxx`

### 3. User Opens Link
- Redirected to beautifully designed password reset page
- Session is automatically validated
- User enters new password with real-time strength feedback

### 4. Password is Updated
- Supabase Auth securely updates the password
- User sees success animation
- Automatically redirected back to mobile app: `jamiifund://password-reset-success`

## Supabase Setup

### 1. Configure Email Templates
In your Supabase Dashboard:

1. Go to **Authentication** → **Email Templates**
2. Select **Reset Password** template
3. Update the template with your redirect URL:

```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .SiteURL }}/forgot-password?token={{ .Token }}">Reset Password</a></p>
```

### 2. Set Redirect URLs
In **Authentication** → **URL Configuration**:
- Add your production URL: `https://jamiifund.com`
- Add localhost for testing: `http://localhost:3000`

### 3. Configure Site URL
In **Settings** → **API**:
- Set **Site URL** to your domain

## Environment Variables

Add to your `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Site URL (for password reset redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # or your production URL
```

## API Endpoints

### POST `/api/auth/reset-password`
Initiates password reset process.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

**Response (Error):**
```json
{
  "error": "Email not found"
}
```

## Password Requirements

- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (recommended)
- ✅ At least one lowercase letter (recommended)
- ✅ At least one number (recommended)
- ✅ At least one special character (recommended)
- ✅ Must match confirmation field

## Password Strength Calculation

| Strength | Criteria |
|----------|----------|
| **Weak** (<40%) | Less than 8 characters or missing multiple requirements |
| **Medium** (40-69%) | 8+ characters with some uppercase, lowercase, or numbers |
| **Strong** (70-100%) | 12+ characters with uppercase, lowercase, numbers, and symbols |

## Deep Links

After successful password reset, users are redirected to:
```
jamiifund://password-reset-success
```

You can handle this in your mobile app to show a success message and redirect to login.

## Testing Locally

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the reset request:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

3. **Check your email** for the reset link

4. **Click the link** and you'll be taken to the password reset page

5. **Enter new password** and test the validation

## Mobile App Integration

### Request Password Reset
```dart
// Flutter example
Future<void> requestPasswordReset(String email) async {
  final response = await http.post(
    Uri.parse('https://your-domain.com/api/auth/reset-password'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'email': email}),
  );
  
  if (response.statusCode == 200) {
    // Show success message
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Check Your Email'),
        content: Text('We sent you a password reset link.'),
      ),
    );
  }
}
```

### Handle Deep Link
```dart
// Handle the success redirect
void handleDeepLink(Uri uri) {
  if (uri.scheme == 'jamiifund' && uri.host == 'password-reset-success') {
    // Show success message
    // Navigate to login screen
    Navigator.pushReplacementNamed(context, '/login');
  }
}
```

## Troubleshooting

### Email not sending?
- Check Supabase email settings in Dashboard
- Verify email templates are configured
- Check spam folder
- Ensure SMTP is configured (or use Supabase's built-in email)

### Token expired?
- Password reset tokens expire after 1 hour by default
- User needs to request a new reset link

### Redirect not working?
- Verify `NEXT_PUBLIC_SITE_URL` is set correctly
- Check Supabase redirect URL configuration
- Ensure deep link scheme is registered in mobile app

## Security Best Practices

✅ **Implemented:**
- Secure token-based authentication
- Password strength validation
- Session validation
- HTTPS only in production
- No password exposed in URLs or logs

🔒 **Recommended:**
- Enable rate limiting on reset endpoint
- Add CAPTCHA to prevent abuse
- Log password reset attempts
- Implement account lockout after multiple failed attempts

## UI Animations

The password reset page includes:
- ✨ Floating particle background
- 🌊 Animated gradient waves
- 💫 Smooth slide-up transitions
- 📊 Real-time password strength bar
- ✅ Success celebration animation
- ⚠️ Shake animation on errors
- 🎯 Pulsing logo effect

## Support

For issues or questions:
- Email: support@jamiifund.com
- GitHub: [Create an issue](https://github.com/salumusabri05/jamiifund-redirects/issues)

---

Made with 💜 by JamiiFund Team
