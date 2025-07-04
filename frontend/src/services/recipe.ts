// src/services/auth.ts
import { apiClient } from './api/client';
import { 
  LoginCredentials, 
  AuthResponse, 
  RecuperarClaveData, 
  VerificarCodigoData, 
  ActualizarClaveData,
  ApiResponse, 
  Receta
} from '@/types';

export const recipeService = {
  async getById(recipeId): Promise<ApiResponse<Receta>> {
    return apiClient.get(`/?id=${recipeId}`);
  },
  async valorar(recipeId): Promise<ApiResponse<Receta>> {
    return apiClient.get(`/?id=${recipeId}/valorar`);
  },
};