// src/navigation/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BrowseStackParamList } from '@/types';

import IndexScreen from '../screens/browse/IndexScreen';
import CategoriesScreen from '../screens/browse/CategoriesScreen';
import AdvanceSearchScreen from '../screens/browse/AdvanceSearchScreen';
import SearchResultScreen from '../screens/browse/SearchResultScreen';

const Stack = createNativeStackNavigator<BrowseStackParamList>();

const BrowseNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="Index"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Index" component={IndexScreen} />
      <Stack.Screen name="Categorias" component={CategoriesScreen} />
      <Stack.Screen name="BusquedaAvanzada" component={AdvanceSearchScreen} />
      <Stack.Screen name="ResultadoBusqueda" component={SearchResultScreen} />
    </Stack.Navigator>
  );
};

export default BrowseNavigator;