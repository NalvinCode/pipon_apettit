import React from 'react';
import {
  StatusBar,
  LogBox,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { QueryClient, QueryClientProvider } from 'react-query';

import AppNavigator from '@/navigation/AppNavigator';
import { AuthProvider } from '@/context/AuthContext';
import { NetworkProvider } from '@/context/NetworkContext';

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    },
  },
});

// Tema personalizado para React Native Paper
const theme = {
  colors: {
    primary: '#0ea5e9',
    accent: '#d946ef',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#1f2937',
    disabled: '#9ca3af',
    placeholder: '#6b7280',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

// Ignorar warnings específicos de desarrollo
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Warning: componentWillReceiveProps has been renamed',
]);

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <NetworkProvider>
            <AuthProvider>
              <StatusBar 
                barStyle="dark-content" 
                backgroundColor="#ffffff" 
                translucent={false}
              />
              <AppNavigator />
              <Toast />
            </AuthProvider>
          </NetworkProvider>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default App;