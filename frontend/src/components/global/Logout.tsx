import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext'; // Importar el contexto de autenticación
import { Ionicons } from '@expo/vector-icons';

const Logout: React.FC = () => {
    const { login, isLoading, error, clearError, logout } = useAuth();
    const handleLogout = () => {
        // Aquí puedes implementar la lógica de cierre de sesión
        Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres cerrar sesión?', [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Cerrar sesión',
                onPress: () => {
                    logout()
                    console.log('Sesión cerrada');
                },
            },
        ]);
    };

    return (
        <TouchableOpacity
            className="items-center justify-center p-2 rounded-xl"
            activeOpacity={0.7}
            onPress={handleLogout}
        >
            <Ionicons name="log-out-outline" size={20} color="#8B7355" />
            <Text className="text-brown-500 text-xs font-semibold mt-1">Logout</Text>
        </TouchableOpacity>
    );
}

export default Logout;