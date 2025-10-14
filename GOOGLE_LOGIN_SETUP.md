# Google OAuth Login - Quick Setup Guide

## ✅ What's Been Implemented

You now have a fully functional Google OAuth login system:

### 1. **Backend API Route** ✅
- Location: `/src/app/api/auth/google-login/route.ts`
- Verifies Google ID tokens
- Creates/authenticates users
- Generates JWT tokens
- Sets HTTP-only cookies

### 2. **Documentation** ✅
- Complete API docs: `GOOGLE_LOGIN_API.md`
- Frontend integration examples
- Error handling guide

### 3. **Example Component** ✅
- Location: `/src/components/GoogleLoginButton.tsx`
- Ready-to-use button component
- Loading states
- Error handling

### 4. **Dependencies** ✅
- `google-auth-library` installed
- TypeScript types configured
- Zero TypeScript errors

---

## 🚀 Quick Start (3 Steps)

### Step 1: Get Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable "Google+ API"
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add Authorized JavaScript origins:
   ```
   http://localhost:3000
   https://yourdomain.com
   ```
7. Copy the **Client ID**

### Step 2: Add Environment Variables

Add to your `.env.local` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com

# JWT (if not already present)
JWT_SECRET=your-super-secret-key-here-minimum-32-chars
JWT_EXPIRES_IN=7d
```

### Step 3: Install Frontend Library

Choose one of these options:

#### Option A: @react-oauth/google (Recommended)
```bash
npm install @react-oauth/google
```

Then wrap your app in `layout.tsx`:
```tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function RootLayout({ children }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      {children}
    </GoogleOAuthProvider>
  );
}
```

#### Option B: Native Google Sign-In Script
No installation needed - uses Google's CDN script.

---

## 📝 Usage Example

### In Your Login Page

```tsx
import GoogleLoginButton from '@/components/GoogleLoginButton';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      
      {/* Your email/password form */}
      
      <div className="my-6 text-center text-gray-500">
        or
      </div>
      
      {/* Google Login Button */}
      <GoogleLoginButton
        onSuccess={(user) => {
          console.log('Logged in:', user);
          // User is automatically redirected to /dashboard
        }}
        onError={(error) => {
          console.error('Login failed:', error);
        }}
      />
    </div>
  );
}
```

---

## 🔧 API Endpoint

### POST `/api/auth/google-login`

**Request:**
```json
{
  "idToken": "google-id-token-from-frontend"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://...",
    "authProvider": "google"
  },
  "token": "jwt-token"
}
```

**Cookies Set:**
- `auth-token`: HTTP-only cookie with JWT

---

## 🔒 Security Features

✅ Token verification with Google's servers  
✅ Email verification required  
✅ HTTP-only cookies (XSS protection)  
✅ Secure cookie flag in production  
✅ SameSite strict cookie policy  
✅ Account linking for existing users  
✅ Duplicate account prevention  

---

## 🎯 Features

1. **New User Registration**
   - Creates user with Google profile data
   - Auto-generates avatar if not provided
   - Sets `authProvider: 'google'`
   - No password required

2. **Existing User Login**
   - Finds user by Google ID or email
   - Generates new JWT token
   - Updates last login

3. **Account Linking**
   - Links local accounts with Google
   - Seamless transition from email/password to Google
   - Preserves user data

4. **Error Handling**
   - Invalid tokens
   - Unverified emails
   - Duplicate accounts
   - Database errors
   - Network issues

---

## 📚 Complete Documentation

For detailed information, see:
- **`GOOGLE_LOGIN_API.md`** - Complete API documentation
- **`src/app/api/auth/google-login/route.ts`** - Fully commented source code
- **`src/components/GoogleLoginButton.tsx`** - Frontend example with comments

---

## 🧪 Testing

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test the Login Flow
1. Go to your login page
2. Click "Continue with Google"
3. Select Google account
4. Should redirect to `/dashboard`
5. Check browser console for user data

### 3. Verify Cookie
Open DevTools → Application → Cookies → `auth-token` should be set

### 4. Test API Directly (Optional)
```bash
curl -X POST http://localhost:3000/api/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{"idToken":"your-google-id-token"}'
```

---

## 🐛 Troubleshooting

### "Invalid Google token"
- Check `GOOGLE_CLIENT_ID` matches frontend
- Ensure token hasn't expired (1 hour lifetime)
- Verify Google Cloud Console credentials

### "Email not verified by Google"
- User's Google account email must be verified
- Ask user to verify email in Google account settings

### "Method not allowed"
- Using GET instead of POST
- Check fetch method in frontend

### Database Connection Error
- Verify `MONGODB_URI` is correct
- Check network/firewall settings
- Ensure IP is whitelisted in MongoDB Atlas

---

## 🎉 You're All Set!

Your Google OAuth login is now ready to use! The implementation is:
- ✅ Production-ready
- ✅ Type-safe (TypeScript)
- ✅ Secure (HTTP-only cookies, token verification)
- ✅ Well-documented
- ✅ Error-handled

Happy coding! 🚀
