import { apiClient } from './api/client';
import {
  ActualizarClaveData,
  ActualizarPerfilData,
  ApiResponse,
  PerfilData,
  Receta,
} from '@/types';

export const userService = {
  async obtenerPerfil(): Promise<ApiResponse<PerfilData>> {
    return apiClient.get(`/user/obtenerPerfil`);
  },
  async listarFavoritos(): Promise<ApiResponse<Receta[]>> {
    return apiClient.get('/user/listarFavoritos');
  },
  async getMisRecetas(): Promise<ApiResponse<Receta[]>> {
    return apiClient.get('/user/listarMisRecetas');
  },
  async toggleFavorite(recipeId): Promise<ApiResponse> {
    return apiClient.put(`/user/toggleFavorite/?recetaId=${recipeId}`);
  },
  async cambiarContraseña(data: ActualizarClaveData): Promise<ApiResponse> {
    return apiClient.put('/user/cambiarContrasena', data);
  },
  async actualizarPerfil(data: ActualizarPerfilData): Promise<ApiResponse> {
    return apiClient.put('/user/actualizarPerfil', data);
  }
};