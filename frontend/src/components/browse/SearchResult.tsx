import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Receta } from '@/types';
import RecetaItem from '@/components/browse/RecetaItem';


interface SearchResultProps {
    recetas: Receta[];
}

const SearchResult: React.FC<SearchResultProps> = ({ recetas }) => {
    return (
        <SafeAreaView className="flex-1 bg-primary-100">
            <View className="flex-1 justify-center px-8">
                {recetas.length === 0 ? (
                    <Text className="text-brown-300 text-lg text-center">No se encontraron recetas.</Text>
                ) : (
                    recetas.map((receta) => (
                        <RecetaItem
                            key={receta.id}
                            receta={receta}>
                        </RecetaItem>
                    ))
                )}
            </View>
        </SafeAreaView>
    );
};

export default SearchResult;