import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BrowseStackParamList, Receta, RecetaSearchFilters } from '@/types';
import { browseService } from '@/services/browse';
import Navbar from '@/components/global/Navbar';
import SearchResult from '@/components/browse/SearchResult';
import SearchBar from '@/components/browse/SearchBar';
import Header from '@/components/global/Header';

type SearchResultsScreenNavigationProp = StackNavigationProp<BrowseStackParamList, 'ResultadoBusqueda'>;
type SearchResultsScreenRouteProp = RouteProp<BrowseStackParamList, 'ResultadoBusqueda'>;

interface Props {
  navigation: SearchResultsScreenNavigationProp;
  route: SearchResultsScreenRouteProp;
}

const SearchResultsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { query } = route.params;

  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<RecetaSearchFilters>({});
  const [currentQuery, setCurrentQuery] = useState<RecetaSearchFilters>(query);

  // Función para manejar la búsqueda - usar useCallback
  const handleSearch = useCallback((searchText: string) => {
    if (searchText.trim()) {
      const query: RecetaSearchFilters = {
        texto: searchText.trim(),
        ...searchQuery // Mantener otros filtros si existen
      };

      performSearch(query);

    }
  }, [searchQuery]);

  // Función para limpiar búsqueda - usar useCallback
  const clearSearch = useCallback(() => {
    setSearchQuery({});
  }, []);

  // Función para realizar búsqueda
  const performSearch = async (searchQuery: RecetaSearchFilters, showLoader: boolean = true) => {
    try {
      if (showLoader) {
        setIsLoading(true);
      }
      setError(null);

      // Llamada al servicio de búsqueda
      const response = await browseService.buscar({ ...searchQuery, page: 1, limit: 10 });

      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          setRecetas(response.data);
          console.log(`🔍 ${response.data.length} recetas encontradas`);
        } else {
          setRecetas([]);
          setError('Formato de datos incorrecto');
        }
      } else {
        console.log('❌ Error en búsqueda:', response.message);
        setError(response.message || 'Error al buscar recetas');
        setRecetas([]);
      }

    } catch (error: any) {
      console.error('❌ Error searching recetas:', error);
      setError('No se pudieron cargar los resultados. Verifica tu conexión.');
      setRecetas([]);

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

  // Función para refrescar
  const onRefresh = async () => {
    setIsRefreshing(true);
    await performSearch(currentQuery, false);
  };

  // Cargar resultados iniciales
  useEffect(() => {
    performSearch(query, true);
  }, []);

  // Estado de carga
  const LoadingState = () => (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#FF6B35" />
      <Text className="text-brown-500 mt-4 text-lg">Buscando recetas...</Text>
    </View>
  );

  // Estado de error
  const ErrorState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text className="text-red-500 text-xl font-bold mt-4 text-center">
        Error en la búsqueda
      </Text>
      <Text className="text-gray-600 text-center mt-2 mb-6">
        {error || 'No se pudieron cargar los resultados'}
      </Text>
      <TouchableOpacity
        className="bg-primary-400 px-6 py-3 rounded-xl"
        onPress={() => performSearch(currentQuery, true)}
      >
        <Text className="text-white font-bold">Intentar de nuevo</Text>
      </TouchableOpacity>
    </View>
  );

  // Estado sin resultados
  const EmptyState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Ionicons name="search-outline" size={64} color="#B8A898" />
      <Text className="text-brown-500 text-xl font-bold mt-4 text-center">
        No se encontraron recetas
      </Text>
      <Text className="text-brown-300 text-center mt-2 mb-6">
        Intenta con otros términos de búsqueda
      </Text>
      <TouchableOpacity
        className="bg-primary-400 px-6 py-3 rounded-xl"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-white font-bold">Volver atrás</Text>
      </TouchableOpacity>
    </View>
  );

  // Contenido principal con resultados
  const ResultsContent = () => (
    <ScrollView
      className="flex-1"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={['#FF6B35']}
          tintColor="#FF6B35"
        />
      }
    >
      <SearchBar initialText={""}
        onSearch={handleSearch}
        onClear={clearSearch} />

      <View className="px-4">
        {/* Header con resultados */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-brown-800 mb-2">
            Resultado Búsqueda
          </Text>
          <View className="bg-primary-400 self-start px-3 py-1 rounded-full">
            <Text className="text-white text-sm font-medium">
              Pipón Appetit
            </Text>
          </View>
        </View>

        {/* Contador de resultados */}
        <View className="mb-4">
          <Text className="text-brown-500 text-base">
            {recetas.length} {recetas.length === 1 ? 'receta encontrada' : 'recetas encontradas'}
            {currentQuery.texto && ` para "${currentQuery.texto}"`}
          </Text>
        </View>

        {/* Lista de recetas */}
        <View className="mb-20">
          <SearchResult recetas={recetas}></SearchResult>
        </View>
      </View>
    </ScrollView>
  );

  // Renderizado condicional
  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1">
          <SearchBar initialText={""}
            onSearch={handleSearch}
            onClear={clearSearch} />
          <LoadingState />
        </View>
      );
    }

    if (error && recetas.length === 0) {
      return (
        <View className="flex-1">
          <SearchBar initialText={""}
            onSearch={handleSearch}
            onClear={clearSearch} />
          <ErrorState />
        </View>
      );
    }

    if (!isLoading && recetas.length === 0) {
      return (
        <View className="flex-1">
          <SearchBar initialText={""}
            onSearch={handleSearch}
            onClear={clearSearch} />
          <EmptyState />
        </View>
      );
    }

    return <ResultsContent />;
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <Header/>
      {renderContent()}
      <Navbar />
    </SafeAreaView>
  );
};

export default SearchResultsScreen;