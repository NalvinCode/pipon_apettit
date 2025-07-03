import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@/types';
import { useAuth } from '@/contexts/AuthContext'; // ← Importar useAuth

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // ✅ Usar el contexto de autenticación
  const { login, isLoading, error, clearError } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Limpiar errores previos
    clearError();

    try {
      // ✅ Usar la función login del contexto
      const success = await login({
        email: email.trim(),
        password
      });

      if (success) {
        console.log('✅ Login exitoso - navegación automática activada');
        // ✅ NO necesitas navegar manualmente
        // El RootNavigator detecta automáticamente isAuthenticated = true
        // y cambia a BrowseNavigator
        
        Alert.alert('Éxito', 'Bienvenido de nuevo!', [
          {
            text: 'OK',
            onPress: () => {
              // La navegación ya se habrá ejecutado automáticamente
              console.log('Usuario redirigido automáticamente');
            }
          }
        ]);
      } else {
        // Mostrar error específico del contexto
        Alert.alert('Error', error || 'Credenciales incorrectas');
      }
    } catch (error: any) {
      console.error('❌ Error inesperado en login:', error);
      Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('RecuperarClave');
  };

  // ✅ Limpiar error cuando el usuario empiece a escribir
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (error) clearError();
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (error) clearError();
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-100">
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

        {/* Mostrar error del contexto si existe */}
        {error && (
          <View className="bg-red-100 border border-red-400 rounded-xl p-4 mb-4">
            <Text className="text-red-700 text-center font-medium">
              {error}
            </Text>
          </View>
        )}

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
              onChangeText={handleEmailChange} // ✅ Usar función que limpia errores
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading} // ✅ Deshabilitar mientras carga
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
              onChangeText={handlePasswordChange} // ✅ Usar función que limpia errores
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading} // ✅ Deshabilitar mientras carga
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
            className={`bg-brown-500 rounded-xl py-4 items-center mt-4 ${isLoading ? 'opacity-50' : ''}`}
            onPress={handleForgotPassword}
            disabled={isLoading} // ✅ Deshabilitar mientras carga
          >
            <Text className="text-white text-lg font-bold">
              Olvidé mi clave
            </Text>
          </TouchableOpacity>
        </View>

        {/* Debug info (solo en desarrollo) */}
        {__DEV__ && (
          <View className="mt-8 p-4 bg-gray-200 rounded-xl">
            <Text className="text-xs text-gray-600">
              Debug: isLoading={isLoading.toString()}, hasError={!!error}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;