import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Receta, RootStackParamList } from '@/types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface RecetaItemProps {
    receta: Receta;
}

const RecetaItem: React.FC<RecetaItemProps> = ({ receta }) => {

    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const onRecipePress = (receta: Receta) => {
        navigation.navigate('Recipe', {
            screen: "RecipeDetail",
            params: {recipeId: receta.id, recipe: receta,}
        });
    }

    return (
        <TouchableOpacity
            className="bg-white rounded-xl p-4 mb-3 shadow-sm"
            // onPress={() => onRecipePress?.(receta)}
            activeOpacity={0.7}
            onPress={() => onRecipePress(receta)}
        >
            <View className="flex-row">
                {/* Imagen de la receta */}
                <View className="w-16 h-16 bg-primary-300 rounded-lg mr-3 justify-center items-center">
                    {receta.media && receta.media.length > 0 ? (
                        <Image
                            source={{ uri: receta.media[0] }}
                            resizeMode="cover"
                        />
                    ) : (
                        <Ionicons name="restaurant-outline" size={24} color="#FF6B35" />
                    )}
                </View>

                {/* Información de la receta */}
                <View className="flex-1">

                    <Text className="text-brown-500 font-bold text-lg mb-2" numberOfLines={1}>
                        {receta.nombre}
                    </Text>

                    <View className="flex-row items-center justify-left gap-5 mb-2">
                        <View className="flex-row items-center">
                            <Ionicons name="time-outline" size={20} color="#B8A898" />
                            <Text className="text-brown-400 text-sm ml-1">
                                {receta.tiempo} min
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Ionicons name="star-outline" size={20} color="#B8A898" />
                            <Text className="text-brown-400 text-sm ml-1">
                                {receta.valoracionPromedio}
                            </Text>
                        </View>
                    </View>

                    <Text className="text-brown-400 text-lg mb-2" numberOfLines={2}>
                        {receta.descripcion}
                    </Text>

                    <View className="flex-row items-center justify-between">
                        <Text className="text-brown-400 text-sm">
                            Por: {receta.usuario}
                        </Text>
                        <View className="flex-row items-center">
                            <Ionicons name="people-outline" size={12} color="#B8A898" />
                            <Text className="text-brown-400 text-sm ml-1">
                                {receta.porciones} porciones
                            </Text>
                        </View>
                    </View>

                </View>
            </View>
        </TouchableOpacity>
    );
};

export default RecetaItem;