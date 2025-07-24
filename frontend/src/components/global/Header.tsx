import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const Header: React.FC = () => {

    return (
        <SafeAreaView
            className="flex justify-center items-center p-2 rounded-xl gap-2"
        >
            <View className='bg-primary-400 p-2 rounded-full'>
                <Image
                    source={require('../../media/LoginPipon.png')}
                    className="w-10 h-10"
                />
            </View>
            <View>
            <Text className="text-xl font-bold text-brown-500 mb-4">Pipón Apetit</Text>
            </View>
        </SafeAreaView>
    );
}

export default Header;