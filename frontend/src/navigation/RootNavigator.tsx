// src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/contexts/AuthContext';

import AuthNavigator from './AuthNavigator';
import BrowseNavigator from './BrowseNavigator';
// import LoadingScreen from '@/components/LoadingScreen';

export type RootStackParamList = {
  Auth: undefined;
  Browse: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
//   if (isLoading) {
//     return <LoadingScreen />;
//   }

  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false, // Ocultar header por defecto
      }}
    >
      {isAuthenticated ? (
        // Usuario autenticado - Mostrar navegación principal
        <Stack.Screen 
          name="Browse" 
          component={BrowseNavigator}
          options={{ gestureEnabled: false }} // Prevenir swipe back
        />
      ) : (
        // Usuario no autenticado - Mostrar pantallas de auth
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{ gestureEnabled: false }}
        />
      )}
    </Stack.Navigator>
  );
}