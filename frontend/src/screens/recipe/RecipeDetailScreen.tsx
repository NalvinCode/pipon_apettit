import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Receta, RecipeStackParamList, Valoracion } from '@/types';
import { recipeService } from '@/services/recipe';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/user';
import Navbar from '@/components/global/Navbar';

type RecipeDetailScreenNavigationProp = StackNavigationProp<RecipeStackParamList, 'RecipeDetail'>;
type RecipeDetailcreenRouteProp = RouteProp<RecipeStackParamList, 'RecipeDetail'>;

interface Props {
  navigation: RecipeDetailScreenNavigationProp;
  route: RecipeDetailcreenRouteProp;
}

type TabType = 'Ingredientes' | 'Preparación' | 'Reseñas';

const RecipeDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();

  const { recipeId, recipe: initialRecipe } = route.params;

  const [recipe, setRecipe] = useState<Receta | null>(initialRecipe || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialRecipe);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('Ingredientes');
  const [isStartCooking, setIsStartCooking] = useState<boolean>(false);
  const [currentPortions, setCurrentPortions] = useState<number>(recipe?.porciones || 1);
  const [reseñas, setReseñas] = useState<Valoracion[]>([])

  // Cargar detalles de la receta si no se pasó inicialmente
  useEffect(() => {
    fetchRecipeDetails()
  }, [recipeId]);

  // Actualizar porciones cuando cambie la receta
  // Verificar si la receta está en favoritos
  useEffect(() => {
    if (recipe) {
      setCurrentPortions(recipe.porciones);
      setIsFavorite(recipe.favorito);
    }
  }, [recipe]);

  const fetchRecipeDetails = async () => {
    try {
      setIsLoading(true);
      const response = await recipeService.getById(recipeId);
      console.log(response)
      if (response.success && response.data) {
        setRecipe(response.data);
      } else {
        Alert.alert('Error', 'No se pudo cargar la receta');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
      Alert.alert('Error', 'Error de conexión');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchValoraciones = async () => {
    try {
      setIsLoading(true);
      const response = await recipeService.getValoraciones(recipeId);

      if (response.success && response.data) {
        setReseñas(response.data);
      } else {
        Alert.alert('Error', 'No se pudieron cargar las reseñas');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  }

  const toggleFavorite = async () => {
    try {
      const response = await userService.toggleFavorite(recipeId);

      if (response.success) {
        setIsFavorite(!isFavorite);
      } else {
        Alert.alert('Error', 'Error al agregar o sacar de favoritos');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'Reseñas') {
      fetchValoraciones();
    }
  }, [activeTab]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleStartCooking = () => {
    setIsStartCooking(true);
    setActiveTab('Preparación');
  };

  const increasePortion = () => {
    setCurrentPortions(prev => prev + 1);
  };

  const decreasePortion = () => {
    setCurrentPortions(prev => prev > 1 ? prev - 1 : 1);
  };

  const calculateAdjustedQuantity = (originalQuantity: number): string => {
    if (!recipe) return originalQuantity.toString();

    const multiplier = currentPortions / recipe.porciones;
    const adjustedQuantity = originalQuantity * multiplier;

    // Formatear el número para mostrar decimales solo cuando sea necesario
    if (adjustedQuantity % 1 === 0) {
      return adjustedQuantity.toString();
    } else {
      return adjustedQuantity.toFixed(1);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? 'star' : 'star-outline'}
        size={16}
        color="#FFD93D"
      />
    ));
  };

  const renderTabContent = () => {
    if (!recipe) return null;

    switch (activeTab) {
      case 'Ingredientes':
        return (
          <View className="px-5 pb-8">
            {/* Control de porciones */}
            <View className="bg-primary-300 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center justify-between">
                <View className='flex-row'>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={currentPortions <= 1 ? "#D2C4B8" : "#8B4513"}
                  />
                  <Text className="text-brown-500 font-medium text-base mb-1">
                    Porciones
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={decreasePortion}
                    className="w-7 h-7 bg-white rounded-full items-center justify-center mr-4 shadow-sm"
                    disabled={currentPortions <= 1}
                  >
                    <Ionicons
                      name="remove"
                      size={10}
                      color={currentPortions <= 1 ? "#D2C4B8" : "#8B4513"}
                    />
                  </TouchableOpacity>

                  <View className="bg-primary-500 rounded-full w-10 h-10 items-center justify-center">
                    <Text className="text-white font-bold text-lg">
                      {currentPortions}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={increasePortion}
                    className="w-7 h-7 bg-white rounded-full items-center justify-center ml-4 shadow-sm"
                  >
                    <Ionicons name="add" size={10} color="#8B4513" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Lista de ingredientes */}
            {recipe.ingredientes.map((ingrediente, index) => (
              <View
                key={index}
                className="flex-row items-center py-3 px-4 bg-white rounded-xl mb-2 shadow-sm"
              >
                <Text className="text-brown-500 font-medium text-base flex-1">
                  {ingrediente.nombre}
                </Text>
                <Text className="text-brown-400 text-sm font-medium">
                  {calculateAdjustedQuantity(Number(ingrediente.cantidad))} {ingrediente.unidad}
                </Text>
              </View>
            ))}
          </View>
        );

      case 'Preparación':
        return (
          <View className="px-5 pb-8">
            {recipe.pasos.map((paso, index) => (
              <View
                key={index}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm"
              >
                <View className="flex-row items-start">
                  <View className="w-8 h-8 bg-primary-500 rounded-full items-center justify-center mr-3 mt-1">
                    <Text className="text-white font-bold text-sm">
                      {paso.orden}
                    </Text>
                  </View>
                  <Text className="text-brown-500 text-base flex-1 leading-6">
                    {paso.descripcion}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        );

      case 'Reseñas':
        return (
          <View className="px-5 pb-8">
            {reseñas.map((review) => (
              <View
                key={review.id}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm"
              >
                <View className="flex-row items-center mb-2">
                  <View className="w-10 h-10 bg-primary-300 rounded-full items-center justify-center mr-3">
                    {/* <Text className="text-lg">{review.avatar}</Text> */}
                  </View>
                  <View className="flex-1">
                    <Text className="text-brown-500 font-medium text-sm">
                      {review.usuario}
                    </Text>
                    <View className="flex-row mt-1">
                      {renderStars(review.puntuacion)}
                    </View>
                  </View>
                </View>
                {review.comentario && (
                  <Text className="text-brown-400 text-sm leading-5 ml-13">
                    {review.comentario}
                  </Text>
                )}
              </View>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  const addReview = () => {
    navigation.navigate('CreateReview', { recipeId: recipeId, recipeName: recipe.nombre });
  }

  const esCreador = () => {
    return recipe.usuario === user.nombre
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-primary-300">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF6B1A" />
          <Text className="mt-4 text-brown-500">Cargando receta...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView className="flex-1 bg-primary-300">
        <View className="flex-1 justify-center items-center">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="mt-4 text-brown-500 text-lg">
            Receta no encontrada
          </Text>
          <TouchableOpacity
            onPress={handleBackPress}
            className="mt-4 bg-primary-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-bold">Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header con imagen */}
        <View className="relative">
          {recipe.media && recipe.media.length > 0 ? (
            <Image
              source={{ uri: recipe.media[0] }}
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-80 bg-primary-300 justify-center items-center">
              <Ionicons name="restaurant-outline" size={80} color="#FF6B1A" />
            </View>
          )}

          {/* Botones flotantes */}
          <View className="absolute top-4 left-4 right-4 flex-row justify-between">
            <TouchableOpacity
              onPress={handleBackPress}
              className="bg-black/50 rounded-full p-2"
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleFavorite}
              className="bg-black/50 rounded-full p-2"
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#FF6B1A' : '#FFFFFF'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Contenido de la receta */}
        <View className="px-5 pt-6">
          {/* Título */}
          <Text className="text-3xl font-bold text-brown-500 mb-2">
            {recipe.nombre}
          </Text>

          <Text className="text-sm text-brown-400 mb-1">
            @{recipe.usuario}
          </Text>

          {/* Info rápida */}
          <View className="flex-row items-center mb-6">
            <View className="flex-row items-center mr-6">
              <Ionicons name="time-outline" size={16} color="#8B4513" />
              <Text className="text-brown-500 ml-1 font-medium">
                {recipe.tiempo} min
              </Text>
            </View>

            <View className="flex-row items-center mr-6">
              <View className="flex-row">
                {renderStars(Math.round(recipe.valoracionPromedio || 0))}
              </View>
              <Text className="text-brown-500 ml-1 font-medium">
                {recipe.valoracionPromedio || 0}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="people-outline" size={16} color="#8B4513" />
              <Text className="text-brown-500 ml-1 font-medium">
                {currentPortions}
              </Text>
            </View>
          </View>

          {/* Tabs */}
          <View className="flex-row bg-primary-300 rounded-2xl p-1 mb-6">
            {(['Ingredientes', 'Preparación', 'Reseñas'] as TabType[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 rounded-xl ${activeTab === tab ? 'bg-primary-500' : 'bg-transparent'
                  }`}
              >
                <Text
                  className={`text-center font-medium ${activeTab === tab ? 'text-white' : 'text-brown-500'
                    }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contenido del tab */}
        {renderTabContent()}
      </ScrollView>

      {/* Filtros - Solo visible en tab de reseñas */}
      {(activeTab === 'Reseñas' && !esCreador()) && (
        <View className="absolute bottom-6 right-5">
          <TouchableOpacity className="bg-primary-500 w-14 h-14 rounded-full items-center justify-center shadow-lg" onPress={addReview}>
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      <Navbar></Navbar>
    </SafeAreaView>
  );
};

export default RecipeDetailScreen;