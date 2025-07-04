import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Receta } from '@/types';
import RecetaItem from '@/components/browse/RecetaItem';

interface SearchResultProps {
    recetas: Receta[];
    showEmptyState?: boolean;
}

const SearchResult: React.FC<SearchResultProps> = ({
    recetas,
    showEmptyState = true
}) => {
    const renderRecipeItem = ({ item }: { item: Receta }) => (
        <RecetaItem
            receta={item}
        />
    );

    if (recetas.length === 0 && showEmptyState) {
        return (
            <View className="bg-white rounded-xl p-8 items-center">
                <Ionicons name="search-outline" size={48} color="#B8A898" />
                <Text className="text-brown-400 text-center mt-4">
                    No se encontraron recetas
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={recetas}
            renderItem={renderRecipeItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false} // Desabilitar scroll interno si está dentro de ScrollView
        />
    );
};

export default SearchResult;