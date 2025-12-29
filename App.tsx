import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { theme } from './src/theme';
import { AppNavigator } from './src/app/AppNavigator';
import { useSessionStore } from './src/store/session';
import { startGpsSimulator } from './src/services/gpsSimulator';

const queryClient = new QueryClient();

export default function App() {
  const loggedIn = useSessionStore((s) => s.loggedIn);

  useEffect(() => {
    if (loggedIn) {
      startGpsSimulator();
    }
  }, [loggedIn]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <StatusBar style="light" />
            <AppNavigator />
          </NavigationContainer>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
