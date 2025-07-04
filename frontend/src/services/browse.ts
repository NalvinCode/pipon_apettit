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

export const browseService = {
  async ultimas(): Promise<ApiResponse<Receta[]>> {
    console.log('🔍 Fetching latest recipes...');
    return apiClient.get('/recetas/ultimas');
  },
};