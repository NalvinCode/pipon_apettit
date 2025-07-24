import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { BrowseStackParamList, Categoria } from '@/types';
import { browseService } from '@/services/browse';
import { recipeService } from '@/services/recipe';

type AdvancedSearchNavigationProp = StackNavigationProp<BrowseStackParamList, 'BusquedaAvanzada'>;
type AdvancedSearchRouteProp = RouteProp<BrowseStackParamList, 'BusquedaAvanzada'>;

interface Props {
  navigation: AdvancedSearchNavigationProp;
  route: AdvancedSearchRouteProp;
}

// Interface para los filtros de búsqueda (igual que el backend)
interface SearchFilters {
  texto?: string;
  autor?: string;
  categorias?: string[];
  ingrediente?: string;
  incluirIngrediente?: boolean;
  tiempoPreparacion?: number;
  valoracion?: number;
  page?: number;
  limit?: number;
}

const AdvancedSearchScreen: React.FC<Props> = ({ navigation, route }) => {
  // Estados para los filtros
  const [filters, setFilters] = useState<SearchFilters>({
    texto: '',
    autor: '',
    categorias: [],
    ingrediente: '',
    incluirIngrediente: true,
    tiempoPreparacion: undefined,
    valoracion: undefined,
    page: 1,
    limit: 20
  });

  // Estados para modales y opciones
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  // Estados para campos dinámicos
  const [tiempoInput, setTiempoInput] = useState('');
  const [valoracionInput, setValoracionInput] = useState('');

  // Cargar categorías al inicializar
  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoadingCategorias(true);
      const response = await recipeService.getCategorias();
      
      if (response.success && response.data) {
        setCategorias(response.data);
      } else {
        Alert.alert('Error', 'No se pudieron cargar las categorías');
      }
    } catch (error) {
      console.error('Error fetching categorias:', error);
      Alert.alert('Error', 'Error al cargar categorías');
    } finally {
      setLoadingCategorias(false);
    }
  };

  // Actualizar filtro específico
  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Toggle categoría seleccionada
  const toggleCategoria = useCallback((categoria: Categoria) => {
    const categoriasActuales = filters.categorias || [];
    const yaSeleccionada = categoriasActuales.find(c => c === categoria.nombre);
    
    if (yaSeleccionada) {
      updateFilter('categorias', categoriasActuales.filter(c => c !== categoria.nombre));
    } else {
      updateFilter('categorias', [...categoriasActuales, categoria.nombre]);
    }
  }, [filters.categorias, updateFilter]);

  // Validar filtros antes de buscar
  const validateFilters = (): boolean => {
    if (tiempoInput && (isNaN(Number(tiempoInput)) || Number(tiempoInput) <= 0)) {
      Alert.alert('Error', 'El tiempo de preparación debe ser un número mayor a 0');
      return false;
    }

    if (valoracionInput && (isNaN(Number(valoracionInput)) || Number(valoracionInput) < 0 || Number(valoracionInput) > 5)) {
      Alert.alert('Error', 'La valoración debe ser un número entre 0 y 5');
      return false;
    }

    return true;
  };

  // Ejecutar búsqueda
  const executeSearch = async () => {
    if (!validateFilters()) return;

    // Preparar filtros finales
    const searchFilters: SearchFilters = {
      ...filters,
      tiempoPreparacion: tiempoInput ? Number(tiempoInput) : undefined,
      valoracion: valoracionInput ? Number(valoracionInput) : undefined,
      page: 1 // Resetear a primera página
    };

    // Verificar que hay al menos un filtro
    if (Object.keys(searchFilters).length === 0) {
      Alert.alert('Advertencia', 'Debe especificar al menos un criterio de búsqueda');
      return;
    }

    console.log(searchFilters);

    // Navegar a resultados
    navigation.navigate('ResultadoBusqueda', {query: searchFilters});
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setFilters({
      texto: '',
      autor: '',
      categorias: [],
      ingrediente: '',
      incluirIngrediente: true,
      tiempoPreparacion: undefined,
      valoracion: undefined,
      page: 1,
      limit: 20
    });
    setTiempoInput('');
    setValoracionInput('');
  };

  // Renderizar estrellas para valoración
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setValoracionInput(i.toString())}
          className="mx-1"
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={24}
            color={i <= rating ? '#FFD93D' : '#D2C4B8'}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-6">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#8B4513" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-brown-800">Búsqueda Avanzada</Text>
          <TouchableOpacity onPress={clearAllFilters}>
            <Ionicons name="refresh-outline" size={24} color="#8B4513" />
          </TouchableOpacity>
        </View>

        <View className="px-4">
          {/* Búsqueda por texto */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-brown-800 mb-3">Búsqueda por texto</Text>
            <TextInput
              value={filters.texto}
              onChangeText={(text) => updateFilter('texto', text)}
              placeholder="Buscar en nombre o descripción..."
              className="bg-white p-3 rounded-lg border border-brown-200"
            />
          </View>

          {/* Búsqueda por autor */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-brown-800 mb-3">Autor</Text>
            <TextInput
              value={filters.autor}
              onChangeText={(text) => updateFilter('autor', text)}
              placeholder="Nombre del autor..."
              className="bg-white p-3 rounded-lg border border-brown-200"
            />
          </View>

          {/* Categorías */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-brown-800">Categorías</Text>
              <TouchableOpacity
                onPress={() => setShowCategoriaModal(true)}
                className="bg-primary-500 px-4 py-2 rounded-lg"
                disabled={loadingCategorias}
              >
                {loadingCategorias ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-medium">Seleccionar</Text>
                )}
              </TouchableOpacity>
            </View>
            
            {filters.categorias && filters.categorias.length > 0 ? (
              <View className="flex-row flex-wrap">
                {filters.categorias.map((categoria, index) => (
                  <View key={index} className="bg-accent-200 px-3 py-1 rounded-full mr-2 mb-2">
                    <Text className="text-brown-800 text-sm">{categoria}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-brown-400 italic">Ninguna categoría seleccionada</Text>
            )}
          </View>

          {/* Ingredientes */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-brown-800 mb-3">Filtro por ingrediente</Text>
            
            <TextInput
              value={filters.ingrediente}
              onChangeText={(text) => updateFilter('ingrediente', text)}
              placeholder="Nombre del ingrediente..."
              className="bg-white p-3 rounded-lg border border-brown-200 mb-3"
            />
            
            <View className="flex-row items-center justify-between bg-white p-3 rounded-lg border border-brown-200">
              <Text className="text-brown-700">
                {filters.incluirIngrediente ? 'Incluir ingrediente' : 'Excluir ingrediente'}
              </Text>
              <Switch
                value={filters.incluirIngrediente}
                onValueChange={(value) => updateFilter('incluirIngrediente', value)}
                trackColor={{ false: '#D2C4B8', true: '#FF6B1A' }}
                thumbColor={filters.incluirIngrediente ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
            
            <Text className="text-brown-400 text-sm mt-2">
              {filters.incluirIngrediente 
                ? 'Buscar recetas que contengan este ingrediente'
                : 'Buscar recetas que NO contengan este ingrediente'
              }
            </Text>
          </View>

          {/* Tiempo de preparación */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-brown-800 mb-3">Tiempo máximo de preparación</Text>
            <View className="flex-row items-center">
              <TextInput
                value={tiempoInput}
                onChangeText={setTiempoInput}
                placeholder="0"
                keyboardType="numeric"
                className="bg-white p-3 rounded-lg border border-brown-200 flex-1 mr-3"
              />
              <Text className="text-brown-600 font-medium">minutos</Text>
            </View>
            <Text className="text-brown-400 text-sm mt-2">
              Buscar recetas que tomen máximo este tiempo
            </Text>
          </View>

          {/* Valoración mínima */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-brown-800 mb-3">Valoración mínima</Text>
            
            <View className="bg-white p-4 rounded-lg border border-brown-200">
              <View className="flex-row justify-center items-center mb-3">
                {renderStars(Number(valoracionInput) || 0)}
              </View>
              
              <TextInput
                value={valoracionInput}
                onChangeText={setValoracionInput}
                placeholder="Valoración (0-5)"
                keyboardType="numeric"
                className="bg-brown-50 p-3 rounded-lg text-center"
              />
            </View>
            
            <Text className="text-brown-400 text-sm mt-2">
              Buscar recetas con valoración igual o superior
            </Text>
          </View>

          {/* Botones de acción */}
          <View className="flex-row mb-6">
            <TouchableOpacity
              onPress={clearAllFilters}
              className="bg-brown-300 p-4 rounded-lg flex-1 mr-3"
            >
              <Text className="text-brown-800 text-center font-bold">Limpiar Filtros</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={executeSearch}
              disabled={loading}
              className="bg-primary-500 p-4 rounded-lg flex-1 ml-3"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-bold">Buscar Recetas</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal de categorías */}
      <Modal
        visible={showCategoriaModal}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white w-4/5 max-h-96 rounded-lg p-4">
            <Text className="text-lg font-bold text-brown-800 mb-4">Seleccionar Categorías</Text>
            
            <FlatList
              data={categorias}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => toggleCategoria(item)}
                  className={`p-3 rounded-lg mb-2 ${
                    filters.categorias?.includes(item.nombre)
                      ? 'bg-primary-300'
                      : 'bg-brown-50'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-brown-800">{item.nombre}</Text>
                    {filters.categorias?.includes(item.nombre) && (
                      <Ionicons name="checkmark" size={20} color="#FF6B1A" />
                    )}
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
            
            <View className="flex-row mt-4">
              <TouchableOpacity
                onPress={() => setShowCategoriaModal(false)}
                className="bg-brown-300 p-3 rounded-lg flex-1 mr-2"
              >
                <Text className="text-brown-800 text-center font-medium">Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setShowCategoriaModal(false)}
                className="bg-primary-500 p-3 rounded-lg flex-1 ml-2"
              >
                <Text className="text-white text-center font-medium">
                  Aplicar ({filters.categorias?.length || 0})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdvancedSearchScreen;