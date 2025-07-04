// src/navigation/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList, Receta, RecipeStackParamList } from '@/types';

import RecipeDetailScreen from '../screens/recipe/RecipeDetailScreen';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const Stack = createNativeStackNavigator<RecipeStackParamList>();

type RecipeNavigationProp = StackNavigationProp<RecipeStackParamList>;
type RecipeRouteProp = RouteProp<RecipeStackParamList, keyof RecipeStackParamList>;

interface Props {
  navigation: RecipeNavigationProp;
  route: RecipeRouteProp;
}

const RecipeNavigator: React.FC<Props> = ({ navigation, route }) => {
  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="RecipeDetail"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} initialParams={route.params} />
    </Stack.Navigator>
  );
};

export default RecipeNavigator;