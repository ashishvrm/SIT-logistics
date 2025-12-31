import { 
  getAuth, 
  signInWithPhoneNumber, 
  PhoneAuthProvider, 
  signInWithCredential,
  onAuthStateChanged,
  User,
  RecaptchaVerifier,
  ConfirmationResult
} from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const SESSION_KEY = 'auth_session';
const DEV_MODE = true; // Set to false in production
const DEV_OTP = '123456'; // Development OTP for testing

interface AuthSession {
  userId: string;
  phoneNumber: string;
  expiresAt: number;
  createdAt: number;
}

/**
 * Firebase Phone Authentication Service
 * Handles phone number verification and OTP authentication
 * 
 * NOTE: Phone auth in React Native requires additional setup with Firebase Admin SDK
 * or a cloud function. For development, we use anonymous auth with phone number storage.
 */
class AuthService {
  private confirmationResult: ConfirmationResult | null = null;
  private pendingPhoneNumber: string | null = null;

  /**
   * Send OTP to phone number
   * In dev mode, uses a simple flow. In production, requires backend support.
   */
  async sendOTP(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📱 Sending OTP to:', phoneNumber);
      
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      this.pendingPhoneNumber = formattedPhone;

      if (DEV_MODE) {
        // Development mode: Store phone and simulate OTP
        console.log(`🔧 DEV MODE: Use OTP ${DEV_OTP} to verify`);
        return { success: true };
      }

      // Production mode would require:
      // 1. Call to backend API to send OTP via Twilio/Firebase Admin
      // 2. Backend stores verification code with expiry
      // 3. Return success
      
      // For now, using Firebase anonymous auth as placeholder
      console.log('✅ OTP sent successfully (dev mode)');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error sending OTP:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send OTP' 
      };
    }
  }

  /**
   * Verify OTP and sign in
   * In dev mode, checks against hardcoded OTP. In production, verifies with backend.
   */
  async verifyOTP(otp: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      if (!this.pendingPhoneNumber) {
        return { 
          success: false, 
          error: 'Please request OTP first' 
        };
      }

      console.log('🔐 Verifying OTP...');

      if (DEV_MODE) {
        // Development mode: Check hardcoded OTP
        if (otp !== DEV_OTP) {
          return {
            success: false,
            error: `Invalid OTP. Use ${DEV_OTP} for testing`
          };
        }

        // Create a mock user object for development
        const mockUser = {
          uid: `dev_${Date.now()}`,
          phoneNumber: this.pendingPhoneNumber
        };

        // Store session with phone number (no Firebase auth required in dev mode)
        await this.storeSessionDev(mockUser.uid, this.pendingPhoneNumber);

        console.log('✅ OTP verified successfully (dev mode)');
        return { success: true, user: mockUser };
      }

      // Production mode would:
      // 1. Call backend API to verify OTP
      // 2. Backend returns custom token
      // 3. Sign in with custom token
      // 4. Store session

      return { success: false, error: 'Production auth not configured' };
    } catch (error: any) {
      console.error('❌ Error verifying OTP:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to verify OTP' 
      };
    }
  }

  /**
   * Store session in dev mode (no Firebase auth)
   */
  private async storeSessionDev(userId: string, phoneNumber: string): Promise<void> {
    const now = Date.now();
    const session: AuthSession = {
      userId: userId,
      phoneNumber: phoneNumber,
      expiresAt: now + SESSION_DURATION,
      createdAt: now
    };

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    console.log('💾 Session stored (dev mode), expires:', new Date(session.expiresAt).toLocaleString());
  }

  /**
   * Store session with phone number
   */
  private async storeSessionWithPhone(user: User, phoneNumber: string): Promise<void> {
    const now = Date.now();
    const session: AuthSession = {
      userId: user.uid,
      phoneNumber: phoneNumber,
      expiresAt: now + SESSION_DURATION,
      createdAt: now
    };

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    console.log('💾 Session stored, expires:', new Date(session.expiresAt).toLocaleString());
  }

  /**
   * Store session with 7 day expiry
   */
  private async storeSession(user: User): Promise<void> {
    const now = Date.now();
    const session: AuthSession = {
      userId: user.uid,
      phoneNumber: user.phoneNumber || '',
      expiresAt: now + SESSION_DURATION,
      createdAt: now
    };

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    console.log('💾 Session stored, expires:', new Date(session.expiresAt).toLocaleString());
  }

  /**
   * Check if session is valid (not expired)
   */
  async isSessionValid(): Promise<boolean> {
    try {
      const sessionStr = await AsyncStorage.getItem(SESSION_KEY);
      if (!sessionStr) return false;

      const session: AuthSession = JSON.parse(sessionStr);
      const isValid = Date.now() < session.expiresAt;

      if (!isValid) {
        await this.clearSession();
        console.log('⏰ Session expired');
      }

      return isValid;
    } catch (error) {
      console.error('❌ Error checking session:', error);
      return false;
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<AuthSession | null> {
    try {
      const sessionStr = await AsyncStorage.getItem(SESSION_KEY);
      if (!sessionStr) return null;

      const session: AuthSession = JSON.parse(sessionStr);
      if (Date.now() >= session.expiresAt) {
        await this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('❌ Error getting session:', error);
      return null;
    }
  }

  /**
   * Clear session and sign out
   */
  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
      // Only sign out from Firebase if there's an actual user
      if (!DEV_MODE && auth.currentUser) {
        await auth.signOut();
      }
      this.pendingPhoneNumber = null;
      console.log('🚪 Session cleared and user signed out');
    } catch (error) {
      console.error('❌ Error clearing session:', error);
    }
  }

  /**
   * Get current Firebase user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    await this.clearSession();
  }
}

export const authService = new AuthService();
