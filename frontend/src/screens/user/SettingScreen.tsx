import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Switch,
    Animated,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { ProfileStackParamList, UserData } from '@/types';
import { userService } from '@/services/user';
import { useAuth } from '@/contexts/AuthContext';

type SettingsNavigationProp = StackNavigationProp<ProfileStackParamList, 'Settings'>;
type SettingsRouteProp = RouteProp<ProfileStackParamList, 'Settings'>;

interface Props {
    navigation: SettingsNavigationProp;
    route: SettingsRouteProp;
}

const UserSettingsScreen: React.FC<Props> = ({ navigation, route }) => {
    const { user, logout, actualizarPerfil, cambiarContraseñaPerfil } = useAuth();

    // Estados principales
    const [userData, setUserData] = useState<UserData>({
        nombre: user?.nombre || '',
        email: user?.email || '',
        bio: user?.bio || '',
    });

    // Estados para UI
    const [isPersonalDataExpanded, setIsPersonalDataExpanded] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [loading, setLoading] = useState(false);

    // Animación para el collapse
    const [collapseAnimation] = useState(new Animated.Value(0));

    // Estados para modal de cambio de contraseña
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        loadUserProfile();
    }, []);

    // Cargar perfil del usuario
    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const response = await userService.obtenerPerfil();

            if (response.success && response.data) {
                setUserData({
                    nombre: response.data.nombre || '',
                    email: response.data.email || '',
                    bio: response.data.bio || ''
                });
            }
        } catch (error: any) {
            console.error('Error loading profile:', error);
            Alert.alert('Error', 'No se pudo cargar el perfil');
        } finally {
            setLoading(false);
        }
    };

    // Toggle del collapse de datos personales
    const togglePersonalData = () => {
        const toValue = isPersonalDataExpanded ? 0 : 1;

        Animated.timing(collapseAnimation, {
            toValue,
            duration: 300,
            useNativeDriver: false,
        }).start();

        setIsPersonalDataExpanded(!isPersonalDataExpanded);
    };

    const clearPasswordData = () => {
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    }

    // Actualizar datos personales
    const updateProfile = async () => {
        try {
            // Validaciones básicas
            if (!userData.nombre.trim()) {
                Alert.alert('Error', 'El nombre es obligatorio');
                return;
            }

            if (!userData.email.trim()) {
                Alert.alert('Error', 'El email es obligatorio');
                return;
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                Alert.alert('Error', 'El formato del email no es válido');
                return;
            }

            setIsUpdatingProfile(true);

            const success = await actualizarPerfil({
                nombre: userData.nombre.trim(),
                email: userData.email.trim(),
                bio: userData.bio.trim()
            });

            if (success) {
                Alert.alert('Éxito', 'Perfil actualizado correctamente', [
                    {
                        text: 'OK',
                    }
                ]);
            } else {
                Alert.alert('Error', 'Ocurrió un error al actualizar perfil', [
                    {
                        text: 'OK'
                    }
                ]);
            }

        } catch (error: any) {
            Alert.alert('Error', error.message || 'No se pudieron actualizar los datos');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    // Cambiar contraseña
    const changePassword = async () => {
        try {
            // Validaciones
            if (!passwordData.currentPassword) {
                Alert.alert('Error', 'Ingresa tu contraseña actual');
                return;
            }

            if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
                Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
                return;
            }

            if (passwordData.newPassword !== passwordData.confirmPassword) {
                Alert.alert('Error', 'Las contraseñas no coinciden');
                return;
            }

            setLoading(true);

            const success = await cambiarContraseñaPerfil({
                claveActual: passwordData.currentPassword,
                nuevaClave: passwordData.newPassword
            });

            if (success) {
                Alert.alert('Éxito', 'Contraseña actualizada correctamente!', [
                    {
                        text: 'OK',
                        onPress: () => {
                            setShowPasswordModal(false);
                            clearPasswordData();
                        }
                    }
                ]);
            } else {
                Alert.alert('Error', 'Ocurrió un error al actualizar contraseña', [
                    {
                        text: 'OK'
                    }
                ]);
            }

        } catch (error: any) {
            Alert.alert('Error', error.message || 'No se pudo cambiar la contraseña');
        } finally {
            setLoading(false);
        }
    };

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
                },
            },
        ]);
    };

    const animatedHeight = collapseAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 320], // Altura aproximada del contenido expandido
    });

    const rotateIcon = collapseAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    return (
        <SafeAreaView className="flex-1 bg-primary-50">
            <ScrollView className="flex-1">
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-6">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#8B4513" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-brown-800">Configuración</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View className="px-4">
                    {/* Datos Personales - Collapse */}
                    <View className="bg-white rounded-lg mb-4 overflow-hidden shadow-sm">
                        <TouchableOpacity
                            onPress={togglePersonalData}
                            className="flex-row items-center justify-between p-4"
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="person-outline" size={24} color="#8B4513" />
                                <Text className="text-brown-800 text-lg font-semibold ml-3">
                                    Datos Personales
                                </Text>
                            </View>
                            <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
                                <Ionicons name="chevron-down" size={20} color="#8B4513" />
                            </Animated.View>
                        </TouchableOpacity>

                        <Animated.View style={{ height: animatedHeight, overflow: 'hidden' }}>
                            <View className="px-4 pb-4">
                                {/* Nombre */}
                                <View className="mb-4">
                                    <Text className="text-brown-700 mb-2 font-medium">Nombre</Text>
                                    <TextInput
                                        value={userData.nombre}
                                        onChangeText={(text) => setUserData(prev => ({ ...prev, nombre: text }))}
                                        placeholder="Tu nombre"
                                        className="bg-brown-50 p-3 rounded-lg border border-brown-200"
                                    />
                                </View>

                                {/* Email */}
                                <View className="mb-4">
                                    <Text className="text-brown-700 mb-2 font-medium">Email</Text>
                                    <TextInput
                                        value={userData.email}
                                        onChangeText={(text) => setUserData(prev => ({ ...prev, email: text }))}
                                        placeholder="tu@email.com"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        className="bg-brown-50 p-3 rounded-lg border border-brown-200"
                                    />
                                </View>

                                {/* Biografía */}
                                <View className="mb-4">
                                    <Text className="text-brown-700 mb-2 font-medium">Biografía</Text>
                                    <TextInput
                                        value={userData.bio}
                                        onChangeText={(text) => setUserData(prev => ({ ...prev, bio: text }))}
                                        placeholder="Cuéntanos sobre ti..."
                                        multiline
                                        numberOfLines={3}
                                        className="bg-brown-50 p-3 rounded-lg border border-brown-200"
                                    />
                                </View>

                                {/* Botón Actualizar */}
                                <TouchableOpacity
                                    onPress={updateProfile}
                                    disabled={isUpdatingProfile}
                                    className="bg-primary-500 p-3 rounded-lg"
                                >
                                    {isUpdatingProfile ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white text-center font-bold">
                                            Actualizar Datos
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>

                    {/* Cambiar Contraseña */}
                    <TouchableOpacity
                        onPress={() => setShowPasswordModal(true)}
                        className="bg-white rounded-lg p-4 mb-4 flex-row items-center justify-between shadow-sm"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="lock-closed-outline" size={24} color="#8B4513" />
                            <Text className="text-brown-800 text-lg font-semibold ml-3">
                                Cambiar Contraseña
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#B8A898" />
                    </TouchableOpacity>

                    {/* Notificaciones */}
                    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <Ionicons name="notifications-outline" size={24} color="#8B4513" />
                                <View className="ml-3 flex-1">
                                    <Text className="text-brown-800 text-lg font-semibold">
                                        Notificaciones
                                    </Text>
                                    <Text className="text-brown-500 text-sm">
                                        Recibir notificaciones de la app
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: '#D2C4B8', true: '#FF6B1A' }}
                                thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
                            />
                        </View>
                    </View>

                    {/* Cerrar Sesión */}
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="bg-red-500 rounded-lg p-4 mb-6 flex-row items-center justify-center"
                    >
                        <Ionicons name="log-out-outline" size={24} color="white" />
                        <Text className="text-white text-lg font-bold ml-3">
                            Cerrar Sesión
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal Cambiar Contraseña */}
            <Modal visible={showPasswordModal} animationType="slide" transparent={true}>
                <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                    <View className="bg-white w-4/5 rounded-lg p-6">
                        <Text className="text-lg font-bold text-brown-800 mb-4">
                            Cambiar Contraseña
                        </Text>

                        <TextInput
                            value={passwordData.currentPassword}
                            onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
                            placeholder="Contraseña actual"
                            secureTextEntry
                            className="bg-brown-50 p-3 rounded-lg border border-brown-200 mb-3"
                        />

                        <TextInput
                            value={passwordData.newPassword}
                            onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
                            placeholder="Nueva contraseña"
                            secureTextEntry
                            className="bg-brown-50 p-3 rounded-lg border border-brown-200 mb-3"
                        />

                        <TextInput
                            value={passwordData.confirmPassword}
                            onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
                            placeholder="Confirmar nueva contraseña"
                            secureTextEntry
                            className="bg-brown-50 p-3 rounded-lg border border-brown-200 mb-4"
                        />

                        <View className="flex-row">
                            <TouchableOpacity
                                onPress={() => {
                                    setShowPasswordModal(false);
                                    clearPasswordData();
                                }}
                                className="bg-brown-300 p-3 rounded-lg flex-1 mr-2"
                            >
                                <Text className="text-brown-800 text-center font-medium">
                                    Cancelar
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={changePassword}
                                disabled={loading}
                                className="bg-primary-500 p-3 rounded-lg flex-1 ml-2"
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white text-center font-medium">
                                        Cambiar
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default UserSettingsScreen;