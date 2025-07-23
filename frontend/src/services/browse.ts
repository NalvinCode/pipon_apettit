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
  RecetaSearchFilters,
  PaginatedResponse,
  PaginatedRequest
} from '@/types';

export const browseService = {
  async ultimas(): Promise<ApiResponse<Receta[]>> {
    return apiClient.get('/recetas/ultimas');
  },
  async buscar(searchQuery: RecetaSearchFilters): Promise<ApiResponse<PaginatedResponse<Receta>>> {
    return apiClient.get(`/recetas/buscar`, { params: searchQuery });
  },
};