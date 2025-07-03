// src/navigation/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';

import LoginScreen from '../screens/auth/LoginScreen';
import RecuperarClaveScreen from '../screens/auth/RecuperarClaveScreen';
import VerificarCodigoScreen from '../screens/auth/VerificarCodigoScreen';
import NuevaClaveScreen from '../screens/auth/NuevaClaveScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RecuperarClave" component={RecuperarClaveScreen} />
      <Stack.Screen name="VerificarCodigo" component={VerificarCodigoScreen} />
      <Stack.Screen name="NuevaClave" component={NuevaClaveScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;