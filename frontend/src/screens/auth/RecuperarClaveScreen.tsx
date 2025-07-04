// src/screens/auth/RecuperarClaveScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@/types';
import { useAuth } from '@/contexts/AuthContext'; // ← Importar useAuth

type RecuperarClaveScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'RecuperarClave'>;

interface Props {
  navigation: RecuperarClaveScreenNavigationProp;
}

const RecuperarClaveScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { recuperarClave } = useAuth();

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    try {
      setIsLoading(true);
      const success = await recuperarClave({ email: email.trim() });

      if (success) {
        Alert.alert(
          'Éxito',
          'El código de recuperación ha sido enviado a tu email',
          [
            {
              text: 'Ok',
              onPress: () => navigation.navigate('VerificarCodigo', 
                { email: email.trim() }
              ),
            }
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al enviar el código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-100">
      <View className="flex-1 justify-center px-8">
        {/* Botón Volver */}
        <TouchableOpacity
          className="absolute top-16 left-8 bg-brown-500 rounded-full w-12 h-12 items-center justify-center"
          onPress={handleGoBack}
        >
          <Text className="text-white text-xl">←</Text>
        </TouchableOpacity>

        {/* Título */}
        <View className="items-center mb-12">
          <Text className="text-3xl font-bold text-brown-500 mb-4">
            Recuperar Clave
          </Text>
          <Text className="text-brown-300 text-center leading-6">
            Ingresa tu email y te enviaremos un código de 4 dígitos para restablecer tu contraseña
          </Text>
        </View>

        {/* Formulario */}
        <View className="space-y-4">
          {/* Campo Email */}
          <View>
            <Text className="text-brown-500 font-medium mb-2">Email</Text>
            <TextInput
              className="bg-white rounded-xl px-4 py-4 text-brown-500 border border-brown-200"
              placeholder="ejemplo@correo.com"
              placeholderTextColor="#B8A898"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Botón Enviar Código */}
          <TouchableOpacity
            className={`bg-primary-400 rounded-xl py-4 items-center mt-6 ${isLoading ? 'opacity-50' : ''}`}
            onPress={handleSendCode}
            disabled={isLoading}
          >
            <Text className="text-white text-lg font-bold">
              {isLoading ? 'Enviando...' : 'Enviar código de recuperación'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RecuperarClaveScreen;