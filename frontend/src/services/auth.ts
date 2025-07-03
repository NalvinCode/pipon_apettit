// src/services/auth.ts
import { apiClient } from './api/client';
import { 
  LoginCredentials, 
  AuthResponse, 
  RecuperarClaveData, 
  VerificarCodigoData, 
  ActualizarClaveData,
  ApiResponse 
} from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post('/auth/login', credentials);
  },

  async recuperarClave(data: RecuperarClaveData): Promise<ApiResponse<null>> {
    return apiClient.post('/auth/recuperar-clave', data);
  },

  async verificarCodigo(data: VerificarCodigoData): Promise<ApiResponse<{ emailVerificado: string }>> {
    return apiClient.post('/auth/verificar-codigo', data);
  },

  async actualizarClave(data: ActualizarClaveData): Promise<ApiResponse<null>> {
    return apiClient.post('/auth/actualizar-clave', data);
  }
};