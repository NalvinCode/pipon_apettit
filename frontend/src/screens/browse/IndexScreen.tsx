import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  RefreshControl,
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import Navbar from '@/components/global/Navbar';
import SearchResult from '@/components/browse/SearchResult';
import { Receta } from '@/types';
import { BrowseStackParamList } from '@/types';
import { browseService } from '@/services/browse';
import { useAuth } from '@/contexts/AuthContext';

type IndexScreenNavigationProp = StackNavigationProp<BrowseStackParamList, 'Index'>;

interface Props {
  navigation: IndexScreenNavigationProp;
}

const IndexScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  
  // Estados para manejar la carga y datos
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar recetas
  const fetchRecetas = async (showLoader: boolean = true) => {
    try {
      if (showLoader) {
        setIsLoading(true);
      }
      setError(null);
      
      const response = await browseService.ultimas();
      
      // Verificar que la respuesta sea exitosa y tenga datos
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          setRecetas(response.data);
          console.log(`📋 ${response.data.length} recetas cargadas correctamente`);
        } else if (Array.isArray(response.data)) {
          // Por si el backend devuelve directamente el array
          setRecetas(response.data);
          console.log(`📋 ${response.data} recetas cargadas correctamente`);
        } else {
          console.warn('⚠️ Formato de respuesta inesperado:', response.data);
          setRecetas([]);
          setError('Formato de datos incorrecto');
        }
      } else {
        console.log('❌ Error en la respuesta:', response.message);
        setError(response.message || 'Error al cargar recetas');
        setRecetas([]);
      }
      
    } catch (error: any) {
      console.error('❌ Error fetching recetas:', error);
      setError('No se pudieron cargar las recetas. Verifica tu conexión.');
      setRecetas([]);
      
      // Solo mostrar Alert si es un error crítico
      if (error.code === 'NETWORK_ERROR') {
        Alert.alert(
          'Error de Conexión', 
          'No se pudo conectar al servidor. Verifica tu conexión a internet.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Función para refrescar (pull to refresh)
  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchRecetas(false); // No mostrar loader principal durante refresh
  };

  // Función para retry
  const handleRetry = () => {
    fetchRecetas(true);
  };

  // Cargar recetas al montar el componente
  useEffect(() => {
    fetchRecetas(true);
  }, []);

  // Componente de estado de carga
  const LoadingState = () => (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#FF6B35" />
      <Text className="text-brown-500 mt-4 text-lg">Cargando recetas...</Text>
      <Text className="text-brown-300 mt-2 text-sm">Un momento por favor</Text>
    </View>
  );

  // Componente de estado de error
  const ErrorState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text className="text-red-500 text-xl font-bold mt-4 text-center">
        Oops, algo salió mal
      </Text>
      <Text className="text-gray-600 text-center mt-2 mb-6">
        {error || 'No se pudieron cargar las recetas'}
      </Text>
      <TouchableOpacity
        className="bg-primary-400 px-6 py-3 rounded-xl"
        onPress={handleRetry}
      >
        <View className="flex-row items-center">
          <Ionicons name="refresh-outline" size={20} color="white" />
          <Text className="text-white font-bold ml-2">Intentar de nuevo</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Componente de estado vacío
  const EmptyState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Ionicons name="restaurant-outline" size={64} color="#B8A898" />
      <Text className="text-brown-500 text-xl font-bold mt-4 text-center">
        No hay recetas disponibles
      </Text>
      <Text className="text-brown-300 text-center mt-2 mb-6">
        Sé el primero en compartir una deliciosa receta
      </Text>
    </View>
  );

  // Componente principal con recetas
  const RecetasContent = () => (
    <ScrollView 
      className="flex-1"
      refreshControl={
        <RefreshControl 
          refreshing={isRefreshing} 
          onRefresh={onRefresh}
          colors={['#FF6B35']} // Android
          tintColor="#FF6B35" // iOS
        />
      }
    >
      <View className="px-4 pt-4">
        {/* Header con saludo personalizado */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-brown-500">
            ¡Hola, {user?.nombre}! 👋
          </Text>
          <Text className="text-brown-300 text-lg mt-1">
            Descubre las últimas recetas
          </Text>
        </View>

        {/* Estadísticas rápidas */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-brown-500 font-semibold">Recetas Nuevas</Text>
              <Text className="text-2xl font-bold text-primary-400">
                {recetas.length}
              </Text>
            </View>
            <View className="bg-primary-100 p-3 rounded-full">
              <Ionicons name="trending-up-outline" size={24} color="#FF6B35" />
            </View>
          </View>
        </View>

        {/* Lista de recetas */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-brown-500">
              Últimas Recetas
            </Text>
            <TouchableOpacity onPress={onRefresh}>
              <Ionicons name="refresh-outline" size={20} color="#B8A898" />
            </TouchableOpacity>
          </View>
          
          <SearchResult recetas={recetas} />
        </View>
      </View>
    </ScrollView>
  );

  // Renderizado condicional basado en el estado
  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }
    
    if (error && recetas.length === 0) {
      return <ErrorState />;
    }
    
    if (!isLoading && recetas.length === 0) {
      return <EmptyState />;
    }
    
    return <RecetasContent />;
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-100">
      {/* Contenido principal */}
      {renderContent()}
      
      {/* Navbar siempre visible */}
      <Navbar />
      
      {/* Debug info (solo en desarrollo) */}
      {__DEV__ && (
        <View className="absolute top-20 right-4 bg-black bg-opacity-75 p-2 rounded">
          <Text className="text-white text-xs">
            Loading: {isLoading.toString()}
          </Text>
          <Text className="text-white text-xs">
            Recetas: {recetas.length}
          </Text>
          <Text className="text-white text-xs">
            Error: {error || 'none'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default IndexScreen;