import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    TextInput,
    StyleSheet,
    Modal,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Receta, RecipeStackParamList, Categoria, Ingrediente, Paso, Valoracion } from '@/types';
import { recipeService } from '@/services/recipe';
import { useAuth } from '@/contexts/AuthContext';

type CreateReviewScreenNavigationProp = StackNavigationProp<RecipeStackParamList, 'CreateReview'>;
type CreateReviewScreenRouteProp = RouteProp<RecipeStackParamList, 'CreateReview'>;

interface Props {
    navigation: CreateReviewScreenNavigationProp;
    route: CreateReviewScreenRouteProp;
}

const CreateReview: React.FC<Props> = ({ navigation, route }) => {
    const { recipeId, recipeName } = route.params;
    const { user } = useAuth();
    
    const [puntuacion, setPuntuacion] = useState<number>(0);
    const [comentario, setComentario] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleStarPress = (rating: number) => {
        setPuntuacion(rating);
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => handleStarPress(i)}
                    className="mx-1"
                >
                    <Ionicons
                        name={i <= puntuacion ? 'star' : 'star-outline'}
                        size={40}
                        color={i <= puntuacion ? '#FFD93D' : '#D2C4B8'}
                    />
                </TouchableOpacity>
            );
        }
        return stars;
    };

    const validarFormulario = () => {
        if (puntuacion === 0) {
            Alert.alert('Error', 'Por favor selecciona una puntuación');
            return false;
        }
        if (!comentario.trim()) {
            Alert.alert('Error', 'Por favor escribe un comentario');
            return false;
        }
        return true;
    };

    const publicarReseña = async () => {
        if (!validarFormulario()) return;

        setLoading(true);
        try {
            const nuevaValoracion: Omit<Valoracion, 'id' | 'receta' | 'usuario'> = {
                puntuacion,
                comentario: comentario.trim(),
            };

            // Aquí harías el llamado al servicio del backend
            await recipeService.valorar(recipeId, nuevaValoracion);
            
            Alert.alert(
                'Éxito', 
                'Tu reseña ha sido publicada exitosamente',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.log(error)
            Alert.alert('Error', 'No se pudo publicar la reseña. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-primary-50">
            <ScrollView className="flex-1">
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-6">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#8B4513" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-brown-800">Añadir Reseña</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View className="px-4">
                    {/* Información de la receta */}
                    <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                        <Text className="text-xl font-bold text-primary-600 text-center">
                            {recipeName}
                        </Text>
                    </View>

                    {/* Puntuación con estrellas */}
                    <View className="bg-white rounded-lg p-6 mb-6 shadow-sm">
                        <Text className="text-lg font-semibold text-brown-800 mb-4 text-center">
                            ¿Cómo calificarías esta receta?
                        </Text>
                        
                        <View className="flex-row justify-center items-center mb-4">
                            {renderStars()}
                        </View>
                        
                        {puntuacion > 0 && (
                            <View className="items-center">
                                <Text className="text-base text-brown-600">
                                    {puntuacion === 1 && "No me gustó"}
                                    {puntuacion === 2 && "Regular"}
                                    {puntuacion === 3 && "Buena"}
                                    {puntuacion === 4 && "Muy buena"}
                                    {puntuacion === 5 && "¡Excelente!"}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Comentario */}
                    <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                        <Text className="text-lg font-semibold text-brown-800 mb-3">
                            Cuéntanos tu experiencia
                        </Text>
                        <TextInput
                            value={comentario}
                            onChangeText={setComentario}
                            placeholder="Escribe aquí tu comentario sobre la receta..."
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            className="bg-brown-50 p-3 rounded-lg border border-brown-200 text-brown-800"
                            style={{ minHeight: 120 }}
                        />
                        <Text className="text-sm text-brown-500 mt-2">
                            Comparte detalles sobre el sabor, dificultad, tiempo de preparación, etc.
                        </Text>
                    </View>

                    {/* Botón publicar */}
                    <TouchableOpacity
                        onPress={publicarReseña}
                        disabled={loading || puntuacion === 0}
                        className={`p-4 rounded-lg items-center mb-8 ${
                            loading || puntuacion === 0
                                ? 'bg-brown-300'
                                : 'bg-primary-500'
                        }`}
                    >
                        {loading ? (
                            <View className="flex-row items-center">
                                <ActivityIndicator color="white" size="small" />
                                <Text className="text-white font-bold text-lg ml-2">
                                    Publicando...
                                </Text>
                            </View>
                        ) : (
                            <Text className="text-white font-bold text-lg">
                                Publicar Reseña
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default CreateReview;