
// src/navigation/RootNavigator.tsx - Actualizado
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/contexts/AuthContext';

import AuthNavigator from './AuthNavigator';
import BrowseNavigator from './BrowseNavigator';
import RecipeNavigator from './RecipeNavigator';

import {RootStackParamList} from '../types/index'
import ProfileNavigator from './ProfileNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false, // Ocultar header por defecto
      }}
    >
      {isAuthenticated ? (
        // Usuario autenticado - Stacks disponibles
        <>
          <Stack.Screen
            name="Browse"
            component={BrowseNavigator}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="Recipe"
            component={RecipeNavigator}
            options={{
              gestureEnabled: true, // Permitir swipe back desde recetas
              presentation: 'modal', // Presentación como modal (opcional)
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileNavigator}
            options={{
              gestureEnabled: true, // Permitir swipe back desde recetas
              presentation: 'modal', // Presentación como modal (opcional)
            }}
          />
        </>
      ) : (
        // Usuario no autenticado - Solo auth
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{ gestureEnabled: false }}
        />
      )}
    </Stack.Navigator>
  );
}