// src/components/global/SimpleNavbar.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <SafeAreaView className="bg-primary-100">
      <View className="bg-white border-t border-primary-200 shadow-lg">
        <View className="flex-row items-center justify-between px-10 py-3">

          {/* Home */}
          <TouchableOpacity
            className="items-center justify-center p-2 rounded-xl"
            activeOpacity={0.7}
          >
            <Ionicons name="home-outline" size={20} color="#8B7355" />
            <Text className="text-brown-500 text-xs font-semibold mt-1">Inicio</Text>
          </TouchableOpacity>

          {/* Search */}
          <TouchableOpacity
            className="items-center justify-center p-2 rounded-xl"
            activeOpacity={0.7}
          >
            <Ionicons name="search-outline" size={20} color="#8B7355" />
            <Text className="text-brown-500 text-xs font-semibold mt-1">Buscar</Text>
          </TouchableOpacity>

          {/* Favorites */}
          <TouchableOpacity
            className="items-center justify-center p-2 rounded-xl"
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={40} color="#8B7355" />
          </TouchableOpacity>

          {/* Profile*/}
          <TouchableOpacity
            className="items-center justify-center p-2 rounded-xl"
            activeOpacity={0.7}
          >
            <Ionicons name="person-outline" size={20} color="#8B7355" />
            <Text className="text-brown-500 text-xs font-semibold mt-1">Perfil</Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
};

export default Navbar;