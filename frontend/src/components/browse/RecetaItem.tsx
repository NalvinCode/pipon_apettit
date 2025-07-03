import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Receta } from '@/types';

interface RecetaItemProps {
    receta: Receta;
}

const RecetaItem: React.FC<RecetaItemProps> = ({ receta }) => {
    return (
        <TouchableOpacity
            className="bg-white rounded-xl p-4 mb-4 shadow"
        >
            <View className="flex-row items-center">
                <View>
                    <img src={receta?.media[0]} alt="Foto Receta"/>
                </View>
                <View className='flex-col'>
                    <Text className="text-brown-500 font-bold text-lg">{receta.nombre}</Text>
                    <View className='flex-row items-center space-x-2 mt-1'>
                        <View className='flex-row iems-center space-x-1'>
                            <img src="../../assets/icons/Clock.png" alt="" />
                            <Text className="text-brown-400 text-xs">{receta.tiempo} min</Text>
                        </View>
                        <View className='flex-row iems-center space-x-1'>
                            <img src="../../assets/icons/Star.png" alt="" />
                            <Text className="text-brown-400 text-xs">{receta.valoracionPromedio?.toFixed(1) || '0'}</Text>
                        </View>
                    </View>
                    <Text className="text-brown-300 text-sm">{receta.descripcion}</Text>
                    <Text className="text-brown-400 text-xs mt-2">Porciones: {receta.porciones}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default RecetaItem;