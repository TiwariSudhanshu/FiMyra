# Google Login API Documentation

## Overview
This API route provides Google OAuth authentication without using NextAuth, Firebase, or Passport. It uses pure Next.js + TypeScript + MongoDB + google-auth-library.

## Endpoint
**POST** `/api/auth/google-login`

## Features
✅ Verifies Google ID token using google-auth-library
✅ Creates new user if doesn't exist
✅ Links existing local accounts with Google
✅ Generates JWT token for authentication
✅ Sets HTTP-only cookie for security
✅ Full TypeScript support with proper types
✅ Comprehensive error handling
✅ Email verification check

## Request

### Headers
```
Content-Type: application/json
```

### Body
```typescript
{
  "idToken": "string" // Google ID token from frontend
}
```

## Response

### Success Response (200 OK)
```typescript
{
  "success": true,
  "message": "Login successful" | "Account created successfully",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "avatar": "string",
    "authProvider": "google",
    "profileCompleted": boolean,
    "createdAt": "Date",
    "updatedAt": "Date"
  },
  "token": "string" // JWT token
}
```

### Error Responses

#### 400 Bad Request
```typescript
{
  "success": false,
  "message": "Google ID token is required" | "Email not verified by Google" | "Invalid Google user ID"
}
```

#### 401 Unauthorized
```typescript
{
  "success": false,
  "message": "Invalid Google token"
}
```

#### 409 Conflict
```typescript
{
  "success": false,
  "message": "An account with this email already exists"
}
```

#### 500 Internal Server Error
```typescript
{
  "success": false,
  "message": "Internal server error. Please try again."
}
```

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com

# JWT Configuration (already exists)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# MongoDB Connection (already exists)
MONGODB_URI=your-mongodb-connection-string
```

## How to Get Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Choose "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
7. Add authorized redirect URIs (if needed):
   - `http://localhost:3000`
   - `https://yourdomain.com`
8. Copy the Client ID

## Frontend Integration Example

### 1. Install Google Sign-In Library

```bash
npm install @react-oauth/google
```

### 2. Add Google Provider to Layout

```tsx
// src/app/layout.tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
```

### 3. Create Login Component

```tsx
// src/components/GoogleLoginButton.tsx
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

export default function GoogleLoginButton() {
  const router = useRouter();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Login successful:', data.user);
        // Store token in localStorage if needed (cookie is already set)
        localStorage.setItem('token', data.token);
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        console.error('Login failed:', data.message);
        alert(data.message);
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
    alert('Google login failed. Please try again.');
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
      useOneTap
      text="continue_with"
      shape="rectangular"
      theme="filled_blue"
      size="large"
    />
  );
}
```

### 4. Alternative: Manual Google Sign-In

```tsx
// src/components/GoogleLoginButton.tsx (Alternative)
'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleLoginButton() {
  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google?.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        { theme: 'filled_blue', size: 'large', text: 'continue_with' }
      );
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    try {
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: response.credential,
        }),
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = '/dashboard';
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  return <div id="googleSignInButton"></div>;
}
```

## Security Features

1. **Token Verification**: Validates Google ID token with Google's servers
2. **Email Verification**: Only accepts verified Google emails
3. **HTTP-Only Cookie**: Token stored in secure HTTP-only cookie
4. **Account Linking**: Safely links existing local accounts with Google
5. **Duplicate Prevention**: Checks for existing accounts by email and Google ID
6. **Environment Variables**: Sensitive data stored securely

## User Flow

### New User
1. User clicks "Sign in with Google"
2. Google authentication popup
3. Frontend receives ID token
4. Send token to `/api/auth/google-login`
5. Backend verifies token with Google
6. Create new user with Google profile data
7. Generate JWT token
8. Return token and user data
9. Redirect to dashboard

### Existing User (Google)
1. Same steps 1-5
2. Find existing user by Google ID
3. Generate new JWT token
4. Return token and user data
5. Redirect to dashboard

### Existing User (Local Account Linking)
1. User has account with email/password
2. Signs in with Google using same email
3. Backend links Google ID to existing account
4. Updates authProvider to 'google'
5. User can now use both methods

## Database Schema

The User model automatically handles Google authentication with these fields:

```typescript
{
  authProvider: 'google',
  googleId: 'string',
  password: undefined, // Not required for Google users
  avatar: 'string', // From Google profile picture
}
```

## Error Handling

The API handles these scenarios:
- Missing ID token
- Invalid/expired Google token
- Unverified email
- Database connection errors
- Duplicate accounts
- Validation errors

## Testing

### Using Postman/Thunder Client

1. Get Google ID token from frontend
2. Make POST request:
```
POST http://localhost:3000/api/auth/google-login
Content-Type: application/json

{
  "idToken": "your-google-id-token"
}
```

### Using cURL

```bash
curl -X POST http://localhost:3000/api/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{"idToken":"your-google-id-token"}'
```

## Notes

- Google ID tokens expire after 1 hour
- JWT tokens expire after 7 days (configurable via JWT_EXPIRES_IN)
- Users can have both local and Google authentication
- Avatar falls back to UI Avatars if not provided by Google
- Password field is optional for Google users

## Support

For issues related to:
- **Google OAuth**: Check Google Cloud Console credentials
- **Token Verification**: Verify GOOGLE_CLIENT_ID matches frontend
- **Database**: Check MongoDB connection
- **JWT**: Verify JWT_SECRET is set correctly
