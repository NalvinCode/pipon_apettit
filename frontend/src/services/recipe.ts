// src/services/auth.ts
import { apiClient } from './api/client';
import { 
  LoginCredentials, 
  AuthResponse, 
  RecuperarClaveData, 
  VerificarCodigoData, 
  ActualizarClaveData,
  ApiResponse, 
  Receta,
  Categoria,
  Valoracion
} from '@/types';

export const recipeService = {
  async getById(recipeId): Promise<ApiResponse<Receta>> {
    return apiClient.get(`/recetas/obtener/?id=${recipeId}`);
  },
  async getCategorias(): Promise<ApiResponse<Categoria[]>> {
    return apiClient.get(`/recetas/categorias`);
  },
  async getValoraciones(recipeId): Promise<ApiResponse<Valoracion[]>> {
    return apiClient.get(`/recetas/valoraciones/?id=${recipeId}`);
  },
  async createRecipe(recipe): Promise<ApiResponse<{recipeId: string}>> {
    return apiClient.post(`/recetas/crear`, recipe);
  },
  async valorar(recipeId, valoracion): Promise<ApiResponse<Valoracion>> {
    return apiClient.post(`/recetas/valorar/?id=${recipeId}`, valoracion);
  },
  async subirImagen(formData : FormData): Promise<ApiResponse> {
    return apiClient.post(`/upload/subir-imagen`, formData);
  }, 
};