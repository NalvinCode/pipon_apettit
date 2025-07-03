// src/screens/auth/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import Navbar from '@/components/global/Navbar';
import SearchResult from '@/components/browse/SearchResult';
import { Receta } from '@/types';

import { BrowseStackParamList } from '@/types';
import { browseService } from '@/services/browse';
import { authService } from '@/services/auth';

import { useAuth } from '@/contexts/AuthContext';

type IndexScreenNavigationProp = StackNavigationProp<BrowseStackParamList, 'Index'>;

interface Props {
  navigation: IndexScreenNavigationProp;
}

const IndexScreen: React.FC<Props> = ({ navigation }) => {

  const [recetas, setRecetas] = useState<Receta[]>([]);

  useEffect(() => {
  const fetchRecetas = async () => {
    try {
      const response = await browseService.ultimas();
      console.log(response.data)
      setRecetas(response.data);
    } catch (error) {
      console.error('Error fetching recetas:', error);
      Alert.alert('Error', 'No se pudieron cargar las recetas.');
    }
  };

  fetchRecetas();
});

  return (
    <SafeAreaView className="flex-1 bg-primary-100">
      <View className="flex-1 justify-center px-8">
        <Text>Ultimas Recetas</Text>
        <SearchResult recetas={recetas}></SearchResult>
      </View>
    </SafeAreaView>
  );
};

export default IndexScreen;