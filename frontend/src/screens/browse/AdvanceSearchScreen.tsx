// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@/types';
import { authService } from '@/services/auth';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authService.login({ email: email.trim(), password });
      
      if (response.success) {
        Alert.alert('Éxito', 'Login exitoso');
        // Aquí redirigirías a la pantalla principal
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('RecuperarClave');
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-300">
      <View className="flex-1 justify-center px-8">
        {/* Título */}
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-brown-500 mb-2">
            Pipón Appétit
          </Text>
          <Text className="text-lg text-brown-300">
            ¡Bienvenido de nuevo!
          </Text>
        </View>

        {/* Formulario */}
        <View className="space-y-4">
          {/* Campo Usuario */}
          <View>
            <Text className="text-brown-500 font-medium mb-2">Usuario</Text>
            <TextInput
              className="bg-white rounded-xl px-4 py-4 text-brown-500 border border-brown-200"
              placeholder="Ingresa tu email"
              placeholderTextColor="#B8A898"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Campo Contraseña */}
          <View>
            <Text className="text-brown-500 font-medium mb-2">Contraseña</Text>
            <TextInput
              className="bg-white rounded-xl px-4 py-4 text-brown-500 border border-brown-200"
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#B8A898"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Botón Iniciar Sesión */}
          <TouchableOpacity
            className={`bg-primary-400 rounded-xl py-4 items-center mt-6 ${isLoading ? 'opacity-50' : ''}`}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text className="text-white text-lg font-bold">
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Text>
          </TouchableOpacity>

          {/* Botón Olvidé mi clave */}
          <TouchableOpacity
            className="bg-brown-500 rounded-xl py-4 items-center mt-4"
            onPress={handleForgotPassword}
          >
            <Text className="text-white text-lg font-bold">
              Olvidé mi clave
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;