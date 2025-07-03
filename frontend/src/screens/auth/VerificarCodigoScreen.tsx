// src/screens/auth/VerificarCodigoScreen.tsx
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '@/types';
import { authService } from '@/services/auth';

type VerificarCodigoScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'VerificarCodigo'>;
type VerificarCodigoScreenRouteProp = RouteProp<AuthStackParamList, 'VerificarCodigo'>;

interface Props {
  navigation: VerificarCodigoScreenNavigationProp;
  route: VerificarCodigoScreenRouteProp;
}

const VerificarCodigoScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params;
  const [codigo, setCodigo] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) return; // Solo un dígito

    const newCodigo = [...codigo];
    newCodigo[index] = text;
    setCodigo(newCodigo);

    // Auto-focus al siguiente campo
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !codigo[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const codigoCompleto = codigo.join('');
    
    if (codigoCompleto.length !== 4) {
      Alert.alert('Error', 'Por favor ingresa el código completo de 4 dígitos');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authService.verificarCodigo({ 
        email, 
        codigo: codigoCompleto 
      });
      
      if (response.success) {
        navigation.navigate('NuevaClave', { email, codigo: codigoCompleto });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Código incorrecto');
      setCodigo(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await authService.recuperarClave({ email });
      if (response.success) {
        Alert.alert('Código reenviado', 'Se ha enviado un nuevo código a tu email');
        setCodigo(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al reenviar el código');
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-100">
      <View className="flex-1 justify-center px-8">
        {/* Título */}
        <View className="items-center mb-12">
          <Text className="text-3xl font-bold text-brown-500 mb-4">
            Verificar Código
          </Text>
          <Text className="text-brown-300 text-center leading-6">
            Ingresa el código de 4 dígitos que enviamos a
          </Text>
          <Text className="text-primary-400 font-medium mt-1">
            {email}
          </Text>
        </View>

        {/* Campos de código */}
        <View className="flex-row justify-center space-x-4 mb-8">
          {codigo.map((digito, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              className={`w-16 h-16 bg-white rounded-xl text-center text-2xl font-bold text-brown-500 border-2 ${
                digito ? 'border-primary-400' : 'border-brown-200'
              }`}
              value={digito}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Botones */}
        <View className="space-y-4">
          {/* Botón Reenviar código */}
          <TouchableOpacity
            className="items-center py-2"
            onPress={handleResendCode}
          >
            <Text className="text-primary-400 font-medium underline">
              Reenviar código
            </Text>
          </TouchableOpacity>

          {/* Botón Confirmar */}
          <TouchableOpacity
            className={`bg-primary-400 rounded-xl py-4 items-center ${
              codigo.join('').length !== 4 || isLoading ? 'opacity-50' : ''
            }`}
            onPress={handleVerifyCode}
            disabled={codigo.join('').length !== 4 || isLoading}
          >
            <Text className="text-white text-lg font-bold">
              {isLoading ? 'Verificando...' : 'Confirmar código de recuperación'}
            </Text>
          </TouchableOpacity>

          {/* Botón Volver al login */}
          <TouchableOpacity
            className="bg-brown-500 rounded-xl py-4 items-center"
            onPress={handleBackToLogin}
          >
            <Text className="text-white text-lg font-bold">
              Regresar al inicio de sesión
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VerificarCodigoScreen;