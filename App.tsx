import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AppNavigator } from './src/app/AppNavigator';
import { useSessionStore } from './src/store/session';
import { authService } from './src/services/authService';
import { startGpsSimulator } from './src/services/gpsSimulator';

const queryClient = new QueryClient();

export default function App() {
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const loggedIn = useSessionStore((s) => s.loggedIn);
  const isSessionExpired = useSessionStore((s) => s.isSessionExpired);
  const reset = useSessionStore((s) => s.reset);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if session is expired
        if (loggedIn && isSessionExpired()) {
          console.log('⏰ Session expired, logging out...');
          await authService.signOut();
          reset();
        } else if (loggedIn) {
          console.log('✅ Session valid, user logged in');
        }
      } catch (error) {
        console.error('❌ Error checking session:', error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (loggedIn) {
      startGpsSimulator();
    }
  }, [loggedIn]);

  if (isCheckingSession) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A' }}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <StatusBar style="light" />
          <AppNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
