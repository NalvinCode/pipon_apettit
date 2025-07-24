// src/navigation/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList, Receta} from '@/types';

import RecipeDetailScreen from '../screens/recipe/RecipeDetailScreen';
import CreateRecipe from '../screens/recipe/CreateRecipe';
import CreateReview from '../screens/recipe/CreateReview';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp} from '@react-navigation/stack';
import {RecipeStackParamList} from '../types/index'


const Stack = createNativeStackNavigator<RecipeStackParamList>();

interface Props {
  route: RouteProp<undefined>;
}

const RecipeNavigator: React.FC<Props> = ({ route }) => {
  
  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} initialParams={route.params} />
      <Stack.Screen name="CreateRecipe" component={CreateRecipe}/>
      <Stack.Screen name="CreateReview" component={CreateReview} initialParams={route.params}/>
    </Stack.Navigator>
  );
};

export default RecipeNavigator;