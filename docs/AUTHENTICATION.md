# Authentication System

## Overview

The app uses Firebase Authentication with phone number verification and OTP (One-Time Password). Sessions persist for 7 days to avoid requiring frequent logins.

## Features

✅ Phone number authentication with OTP verification  
✅ 7-day session persistence using AsyncStorage  
✅ Automatic session expiry check on app start  
✅ Logout functionality with Firebase sign out  
✅ Development mode for easy testing  

## Development Mode

For testing purposes, the authentication service runs in **development mode** with a hardcoded OTP:

**Test OTP: `123456`**

### How to Test

1. **Start the Auth Flow**
   - Enter any phone number (e.g., `+1234567890`)
   - Click "Continue" to send OTP

2. **Verify OTP**
   - Enter the test OTP: `123456`
   - Click "Continue" to verify

3. **Complete Onboarding**
   - Select Organization, Branch, and Role
   - Click "Get Started"

## Session Management

### 7-Day Persistence

- Sessions are stored in AsyncStorage with a 7-day expiry timestamp
- On app launch, the session is checked:
  - ✅ If valid (not expired), user stays logged in
  - ❌ If expired, user is logged out automatically

### Session Data Structure

```typescript
interface AuthSession {
  userId: string;
  phoneNumber: string;
  expiresAt: number;      // Timestamp (now + 7 days)
  createdAt: number;      // Timestamp
}
```

### Session Storage

- **Key**: `auth_session`
- **Storage**: AsyncStorage (persists across app restarts)
- **Duration**: 7 days (604,800,000 milliseconds)

## Logout Flow

1. User clicks "Logout" in Profile screen
2. Confirmation alert is shown
3. On confirm:
   - Firebase auth session cleared (`auth.signOut()`)
   - AsyncStorage session cleared
   - Zustand session store reset
   - User redirected to auth flow

## Production Setup

### Requirements for Production

⚠️ **The current implementation uses development mode.** For production, you need:

1. **Backend API for OTP**
   - Set up a backend service (Node.js, Python, etc.)
   - Use Twilio, Firebase Admin SDK, or similar for sending SMS
   - Store verification codes with expiry (e.g., Redis, Firestore)

2. **API Endpoints**
   ```
   POST /auth/send-otp
   Body: { phoneNumber: string }
   Response: { success: boolean, error?: string }
   
   POST /auth/verify-otp
   Body: { phoneNumber: string, otp: string }
   Response: { success: boolean, customToken?: string }
   ```

3. **Update authService.ts**
   - Set `DEV_MODE = false`
   - Implement API calls in `sendOTP()` and `verifyOTP()`
   - Use Firebase custom tokens for authentication

### Example Production Flow

```typescript
// 1. Send OTP
async sendOTP(phoneNumber: string) {
  const response = await fetch('https://api.yourapp.com/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber })
  });
  return response.json();
}

// 2. Verify OTP
async verifyOTP(otp: string) {
  const response = await fetch('https://api.yourapp.com/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber: this.pendingPhoneNumber, otp })
  });
  const data = await response.json();
  
  // Sign in with custom token
  if (data.customToken) {
    const userCredential = await signInWithCustomToken(auth, data.customToken);
    await this.storeSession(userCredential.user);
    return { success: true, user: userCredential.user };
  }
}
```

## Files Modified

### Core Authentication Files

- **`src/services/authService.ts`**: Phone auth service with OTP handling
- **`src/store/session.ts`**: Session store with phone, userId, and expiry
- **`src/screens/shared/AuthFlow.tsx`**: Auth UI with Firebase integration
- **`src/screens/shared/Profile.tsx`**: Logout functionality
- **`App.tsx`**: Session validation on app start

### Key Changes

1. **Session Store** (`session.ts`)
   - Added `userId`, `phoneNumber`, `authExpiry` fields
   - Added `setUserId()`, `setPhoneNumber()`, `setAuthExpiry()` methods
   - Added `isSessionExpired()` to check expiry

2. **Auth Service** (`authService.ts`)
   - `sendOTP(phoneNumber)`: Sends OTP (dev mode: simulated)
   - `verifyOTP(otp)`: Verifies OTP and signs in
   - `isSessionValid()`: Checks if session is not expired
   - `signOut()`: Clears session and logs out

3. **Auth Flow** (`AuthFlow.tsx`)
   - Step 2: Sends OTP when phone number entered
   - Step 3: Verifies OTP and stores session
   - Shows dev OTP hint in UI
   - Loading states and error handling

4. **App.tsx**
   - Checks session on app start
   - Logs out if session expired
   - Shows loading spinner during check

5. **Profile** (`Profile.tsx`)
   - Logout button with confirmation
   - Shows phone number in profile
   - Calls `authService.signOut()`

## Testing Checklist

- [ ] Enter phone number and send OTP
- [ ] Verify OTP with code `123456`
- [ ] Complete organization/branch/role selection
- [ ] App loads to home screen
- [ ] Close and reopen app - should stay logged in
- [ ] Check Profile screen shows phone number
- [ ] Logout and verify returns to auth flow
- [ ] Login again and verify session persists

## Security Notes

### Development Mode

- Uses anonymous Firebase auth
- OTP is hardcoded (`123456`)
- Suitable for testing only
- Phone number stored in AsyncStorage

### Production Mode

- Use HTTPS for API calls
- Implement rate limiting on OTP endpoint
- Add phone number validation
- Use secure OTP generation (6-digit random)
- Set OTP expiry (e.g., 5 minutes)
- Implement maximum retry attempts
- Use Firebase custom tokens for secure auth

## Troubleshooting

### Session Not Persisting

- Check AsyncStorage permissions
- Verify Zustand persist middleware is configured
- Check browser console for storage errors

### OTP Not Working

- In dev mode, only `123456` works
- Check phone number format (must start with `+`)
- Check console logs for error messages

### Session Expired Too Soon

- Check system clock is correct
- Verify `SESSION_DURATION` is 7 days (604800000 ms)
- Check `authExpiry` timestamp in AsyncStorage

### Can't Logout

- Check Firebase auth state
- Clear AsyncStorage manually if needed: 
  ```javascript
  AsyncStorage.clear()
  ```
- Check network connectivity

## Future Enhancements

- [ ] Biometric authentication (Face ID/Touch ID)
- [ ] Remember device (longer session on trusted devices)
- [ ] Multi-factor authentication
- [ ] Password reset via OTP
- [ ] Email authentication option
- [ ] Social authentication (Google, Apple)
