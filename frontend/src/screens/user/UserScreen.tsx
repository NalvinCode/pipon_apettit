import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { ProfileStackParamList, Receta, RootStackParamList } from '@/types';
import { userService } from '@/services/user';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/global/Navbar';
import SearchResult from '@/components/browse/SearchResult';

type UserProfileNavigationProp = StackNavigationProp<ProfileStackParamList, 'UserProfile'>;
type UserProfileRouteProp = RouteProp<ProfileStackParamList, 'UserProfile'>;

interface Props {
  navigation: UserProfileNavigationProp;
  route: UserProfileRouteProp;
}

type TabType = 'misRecetas' | 'favoritas';

const UserProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  
  // Estados principales
  const [activeTab, setActiveTab] = useState<TabType>('misRecetas');
  const [misRecetas, setMisRecetas] = useState<Receta[]>([]);
  const [favoritas, setFavoritas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos al inicializar
  useEffect(() => {
    loadUserData();
  }, []);

  // Función para cargar datos del usuario
  const loadUserData = async (showLoader: boolean = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);

      await Promise.all([
        loadMisRecetas(),
        loadFavoritas()
      ]);

    } catch (error: any) {
      console.error('Error loading user data:', error);
      setError('Error al cargar datos del perfil');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar mis recetas
  const loadMisRecetas = async () => {
    try {
      const response = await userService.getMisRecetas();
      if (response.success && response.data) {
        setMisRecetas(response.data);
      }
    } catch (error) {
      console.error('Error loading mis recetas:', error);
    }
  };

  // Cargar favoritas
  const loadFavoritas = async () => {
    try {
      const response = await userService.listarFavoritos();
      if (response.success && response.data) {
        setFavoritas(response.data);
      }
    } catch (error) {
      console.error('Error loading favoritas:', error);
    }
  };

  // Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUserData(false);
  }, []);

  // Navegar a detalle de receta
  const navigateToRecipe = (recetaId: string) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
            navigation.navigate('Recipe', {
            screen: "RecipeDetail",
            params: {recipeId: recetaId}
        });
  };

  // Obtener datos de la tab activa
  const getActiveTabData = () => {
    return activeTab === 'misRecetas' ? misRecetas : favoritas;
  };

  // Estado de carga
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-primary-100">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text className="text-brown-500 mt-4 text-lg">Cargando perfil...</Text>
        </View>
        <Navbar />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-100">
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B35']}
            tintColor="#FF6B35"
          />
        }
      >
        {/* Header del perfil */}
        <View className="bg-primary-200 p-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              {/* Avatar del usuario */}
              <View className="w-16 h-16 rounded-full bg-primary-500 justify-center items-center mr-4">
                <Text className="text-white text-2xl font-bold">
                  {user?.nombre?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>

              {/* Información del usuario */}
              <View className="flex-1">
                <Text className="text-brown-800 text-xl font-bold">
                  {user?.nombre || 'Usuario'}
                </Text>
                <Text className="text-primary-600 text-base">
                  {misRecetas.length} recetas
                </Text>
              </View>
            </View>

            {/* Botón de configuración */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('Settings')}
              className="p-2"
            >
              <Ionicons name="settings-outline" size={24} color="#8B4513" />
            </TouchableOpacity>
          </View>

          {/* Descripción del usuario */}
          <View className="bg-white rounded-lg p-4 mt-4">
            <Text className="text-brown-700 text-base leading-5">
              {user.bio}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-white mx-4 mt-4 rounded-lg overflow-hidden shadow-sm">
          <TouchableOpacity
            onPress={() => setActiveTab('misRecetas')}
            className={`flex-1 p-4 ${
              activeTab === 'misRecetas' 
                ? 'bg-primary-500' 
                : 'bg-white'
            }`}
          >
            <Text className={`text-center font-semibold ${
              activeTab === 'misRecetas' 
                ? 'text-white' 
                : 'text-brown-600'
            }`}>
              Mis Recetas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('favoritas')}
            className={`flex-1 p-4 ${
              activeTab === 'favoritas' 
                ? 'bg-primary-500' 
                : 'bg-white'
            }`}
          >
            <Text className={`text-center font-semibold ${
              activeTab === 'favoritas' 
                ? 'text-white' 
                : 'text-brown-600'
            }`}>
              Favoritas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido de las tabs */}
        <View className="px-4 py-4 flex-1">
          {error ? (
            <View className="flex-1 justify-center items-center py-20">
              <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
              <Text className="text-red-500 text-lg font-bold mt-4 text-center">
                {error}
              </Text>
              <TouchableOpacity
                onPress={() => loadUserData()}
                className="bg-primary-500 px-6 py-3 rounded-lg mt-4"
              >
                <Text className="text-white font-bold">Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : getActiveTabData().length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <Ionicons 
                name={activeTab === 'misRecetas' ? 'restaurant-outline' : 'heart-outline'} 
                size={64} 
                color="#B8A898" 
              />
              <Text className="text-brown-500 text-xl font-bold mt-4 text-center">
                {activeTab === 'misRecetas' 
                  ? 'No tienes recetas aún' 
                  : 'No tienes favoritas aún'
                }
              </Text>
              <Text className="text-brown-300 text-center mt-2 mb-6">
                {activeTab === 'misRecetas' 
                  ? 'Comparte tu primera receta deliciosa' 
                  : 'Marca recetas como favoritas para verlas aquí'
                }
              </Text>
              
              {activeTab === 'misRecetas' && (
                <TouchableOpacity
                  // onPress={() => {navigation.navigate('CreateRecipe')}}
                  className="bg-primary-500 px-6 py-3 rounded-lg"
                >
                  <Text className="text-white font-bold">Crear Receta</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <SearchResult recetas={getActiveTabData()} />
          )}
        </View>
      </ScrollView>

      <Navbar />
    </SafeAreaView>
  );
};

export default UserProfileScreen;