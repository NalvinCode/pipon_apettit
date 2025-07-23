// src/services/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../../config/api';
import { ApiResponse, ErrorResponse } from '../../types';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.DEFAULT_HEADERS,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - agregar token automáticamente
    this.instance.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
          const tokenTemp = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN_TEMP);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          if (tokenTemp) {
            config.headers.Authorization = `Bearer ${tokenTemp}`;
          }

        } catch (error) {
          console.warn('Error obteniendo codigo de autenticacion:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - manejar errores globalmente
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Si el token expiró (401), limpiar datos de auth
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await AsyncStorage.multiRemove([
              STORAGE_KEYS.AUTH_TOKEN,
              STORAGE_KEYS.USER_DATA,
              STORAGE_KEYS.REFRESH_TOKEN
            ]);
          } catch (storageError) {
            console.warn('Error clearing auth data:', storageError);
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: any): ErrorResponse {
    if (error.response) {
      // Error del servidor
      return {
        error: error.response.data?.error || 'Error del servidor',
        message: error.response.data?.message || 'Ocurrió un error inesperado',
        statusCode: error.response.status,
        details: error.response.data,
      };
    } else if (error.request) {
      // Error de red
      return {
        error: 'Error de conexión',
        message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        statusCode: 0,
        details: error.request,
      };
    } else {
      // Error desconocido
      return {
        error: 'Error desconocido',
        message: error.message || 'Ocurrió un error inesperado',
        statusCode: 500,
        details: error,
      };
    }
  }

  // Métodos HTTP públicos
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    this.setupInterceptors();
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    this.setupInterceptors();
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    this.setupInterceptors();
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    this.setupInterceptors();
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Método para cambiar la base URL (útil para desarrollo)
  setBaseURL(baseURL: string) {
    this.instance.defaults.baseURL = baseURL;
  }

  // Método para obtener la instancia de axios (si necesitas funcionalidad específica)
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

// Exportar instancia singleton
export const apiClient = new ApiClient();
export default apiClient;