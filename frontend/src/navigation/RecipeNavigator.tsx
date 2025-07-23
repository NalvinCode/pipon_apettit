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

  const params = route.params as { recipeId?: string; recipe?: Receta; action: string} | undefined;

  const recipeId = params?.recipeId;
  const recipe = params?.recipe;
  const action = params?.action;
  
  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {
        action === 'RecipeDetail' && <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} initialParams={{recipeId, recipe}} />
      }
      {
        action === 'CreateRecipe' && <Stack.Screen name="CreateRecipe" component={CreateRecipe}/>
      }
      {
        action === 'CreateReview' && <Stack.Screen name="CreateReview" component={CreateReview} initialParams={{recipeId, recipeName: recipe.nombre}}/>
      }
    </Stack.Navigator>
  );
};

export default RecipeNavigator;