// src/screens/auth/NuevaClaveScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '@/types';
import { useAuth } from '@/contexts/AuthContext'; // ← Importar useAuth

type NuevaClaveScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'NuevaClave'>;
type NuevaClaveScreenRouteProp = RouteProp<AuthStackParamList, 'NuevaClave'>;

interface Props {
  navigation: NuevaClaveScreenNavigationProp;
  route: NuevaClaveScreenRouteProp;
}

const NuevaClaveScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email, codigo } = route.params;
  const [nuevaClave, setNuevaClave] = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string): boolean => {
    return password.length >= 6; // Validación básica
  };

  const {actualizarClave} = useAuth();

  const handleUpdatePassword = async () => {
    if (!nuevaClave.trim() || !confirmarClave.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (nuevaClave !== confirmarClave) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (!validatePassword(nuevaClave)) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setIsLoading(true);
      const success = await actualizarClave({
        email,
        codigo,
        nuevaClave
      });
      
      if (success) {
        Alert.alert(
          'Éxito',
          'Tu contraseña ha sido actualizada exitosamente',
          [
            {
              text: 'Iniciar Sesión',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al actualizar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-300">
      <View className="flex-1 justify-center px-8">
        {/* Título */}
        <View className="items-center mb-12">
          <Text className="text-3xl font-bold text-brown-500 mb-4">
            Nueva Contraseña
          </Text>
          <Text className="text-brown-300 text-center leading-6">
            Crea una nueva contraseña segura para tu cuenta
          </Text>
        </View>

        {/* Formulario */}
        <View className="space-y-4">
          {/* Campo Nueva Contraseña */}
          <View>
            <Text className="text-brown-500 font-medium mb-2">Nueva contraseña</Text>
            <TextInput
              className="bg-white rounded-xl px-4 py-4 text-brown-500 border border-brown-200"
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#B8A898"
              value={nuevaClave}
              onChangeText={setNuevaClave}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Campo Confirmar Contraseña */}
          <View>
            <Text className="text-brown-500 font-medium mb-2">Confirmar contraseña</Text>
            <TextInput
              className="bg-white rounded-xl px-4 py-4 text-brown-500 border border-brown-200"
              placeholder="Repite tu contraseña"
              placeholderTextColor="#B8A898"
              value={confirmarClave}
              onChangeText={setConfirmarClave}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Validación visual */}
          {confirmarClave.length > 0 && (
            <View className="px-2">
              <Text className={`text-sm ${
                nuevaClave === confirmarClave ? 'text-green-600' : 'text-red-500'
              }`}>
                {nuevaClave === confirmarClave ? 
                  '✓ Las contraseñas coinciden' : 
                  '✗ Las contraseñas no coinciden'
                }
              </Text>
            </View>
          )}

          {/* Botón Actualizar */}
          <TouchableOpacity
            className={`bg-primary-400 rounded-xl py-4 items-center mt-6 ${
              !nuevaClave || !confirmarClave || nuevaClave !== confirmarClave || isLoading ? 'opacity-50' : ''
            }`}
            onPress={handleUpdatePassword}
            disabled={!nuevaClave || !confirmarClave || nuevaClave !== confirmarClave || isLoading}
          >
            <Text className="text-white text-lg font-bold">
              {isLoading ? 'Actualizando...' : 'Actualizar Clave'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NuevaClaveScreen;