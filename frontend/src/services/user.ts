import { apiClient } from './api/client';
import {
  ApiResponse,
  Receta, 
} from '@/types';

export const userService = {
  async toggleFavorite(recipeId): Promise<ApiResponse> {
    return apiClient.put(`/user/toggleFavorite/?recetaId=${recipeId}`);
  },
  async listarFavoritos() : Promise<ApiResponse<Receta[]>> {
    return apiClient.get('/user/listarFavoritos');
  }
};