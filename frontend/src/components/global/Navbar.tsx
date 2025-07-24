// src/components/global/SimpleNavbar.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import Logout from './Logout';
import { useNavigation } from '@react-navigation/native';
import { RecipeStackParamList, BrowseStackParamList, RootStackParamList } from '@/types';
import { StackNavigationProp } from '@react-navigation/stack';

const Navbar: React.FC = () => {
  const { user } = useAuth();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const onCreatePress = () => {
    navigation.navigate('Recipe', {
      screen: "CreateRecipe"
    });
  }

  const onHomePress = () => {
    navigation.navigate('Browse', {
      screen: "Index"
    });
  }

  const onSearchPress = () => {
    navigation.navigate('Browse', {
      screen: "BusquedaAvanzada"
    });
  }

    const onProfilePress = () => {
    navigation.navigate('Profile', {
      screen: "UserProfile"
    });
  }

  return (
    <SafeAreaView>
      <View className="bg-white border-t border-primary-200 shadow-lg">
        <View className="flex-row items-center justify-between px-10">
          {/* Home */}
          <TouchableOpacity
            className="items-center justify-center p-2 rounded-xl"
            activeOpacity={0.7}
            onPress={() => onHomePress()}
          >
            <Ionicons name="home-outline" size={20} color="#8B7355" />
            <Text className="text-brown-500 text-xs font-semibold mt-1">Inicio</Text>
          </TouchableOpacity>

          {/* Search */}
          <TouchableOpacity
            className="items-center justify-center p-2 rounded-xl"
            activeOpacity={0.7}
            onPress={() => onSearchPress()}
          >
            <Ionicons name="search-outline" size={20} color="#8B7355" />
            <Text className="text-brown-500 text-xs font-semibold mt-1">Buscar</Text>
          </TouchableOpacity>

          {/* Create */}
          <TouchableOpacity
            className="items-center justify-center p-2 rounded-xl"
            activeOpacity={0.7}
            onPress={() => onCreatePress()}
          >
            <Ionicons name="add-circle-outline" size={40} color="#8B7355" />
          </TouchableOpacity>

          {/* Profile*/}
          <TouchableOpacity
            className="items-center justify-center p-2 rounded-xl"
            activeOpacity={0.7}
            onPress={() => onProfilePress()}
          >
            <Ionicons name="person-outline" size={20} color="#8B7355" />
            <Text className="text-brown-500 text-xs font-semibold mt-1">Perfil</Text>
          </TouchableOpacity>

          {/* Logout (pequeño) */}
          <Logout />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Navbar;